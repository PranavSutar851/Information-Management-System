import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { assessIdea } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, market_size, business_model } = body

    // Validate required fields
    if (!title || !description || !category || !market_size || !business_model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get AI assessment
    const aiAssessment = await assessIdea(title, description, category, market_size, business_model)

    // Insert the idea into the database
    const { data: idea, error: insertError } = await supabase
      .from('ideas')
      .insert({
        founder_id: user.id,
        title,
        description,
        category,
        market_size,
        business_model,
        status: 'submitted',
        ai_score: aiAssessment.overall_score,
        ai_recommendations: {
          innovation: aiAssessment.innovation,
          market_fit: aiAssessment.market_fit,
          team_strength: aiAssessment.team_strength,
          revenue_potential: aiAssessment.revenue_potential,
          recommendations: aiAssessment.recommendations,
          strengths: aiAssessment.strengths,
          concerns: aiAssessment.concerns,
        },
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting idea:', insertError)
      return NextResponse.json({ error: 'Failed to submit idea' }, { status: 500 })
    }

    // Create assessment record
    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        idea_id: idea.id,
        criteria: {
          innovation: aiAssessment.innovation,
          market_fit: aiAssessment.market_fit,
          team_strength: aiAssessment.team_strength,
          revenue_potential: aiAssessment.revenue_potential,
        },
        overall_score: aiAssessment.overall_score,
        completed_at: new Date().toISOString(),
      })

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
    }

    return NextResponse.json({ idea, assessment: aiAssessment })
  } catch (error) {
    console.error('Error in POST /api/ideas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('ideas')
      .select(`
        *,
        users!ideas_founder_id_fkey(name, email)
      `)

    // If founder, only show their ideas
    if (userData.role === 'founder') {
      query = query.eq('founder_id', user.id)
    }

    // Add filters from query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: ideas, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ideas:', error)
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
    }

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Error in GET /api/ideas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}