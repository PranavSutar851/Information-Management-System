import { createClient } from '@/lib/supabase/server'
import { assessIdea } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase.from('ideas_with_details').select('*')

    // Apply role-based filtering
    if (userData?.role === 'founder') {
      query = query.eq('founder_id', user.id)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data: ideas, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Get ideas error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { title, description, category, market_size, business_model } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!title || !description || !category || !market_size || !business_model) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get AI assessment
    const aiAssessment = await assessIdea(title, description, category, market_size, business_model)

    // Insert the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        founder_id: user.id,
        title,
        description,
        category,
        market_size,
        business_model,
        ai_score: aiAssessment.overall_score,
        ai_recommendations: aiAssessment,
        status: 'under_review'
      })
      .select()
      .single()

    if (ideaError) {
      return NextResponse.json({ error: ideaError.message }, { status: 400 })
    }

    // Insert the assessment
    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        idea_id: idea.id,
        criteria: aiAssessment.scores,
        overall_score: aiAssessment.overall_score
      })

    if (assessmentError) {
      console.error('Assessment insert error:', assessmentError)
    }

    return NextResponse.json({
      message: 'Idea submitted successfully',
      idea,
      assessment: aiAssessment
    })
  } catch (error) {
    console.error('Create idea error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}