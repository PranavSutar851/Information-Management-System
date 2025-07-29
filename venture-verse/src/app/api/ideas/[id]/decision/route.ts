import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { decision, funding_amount, competitor_analysis, notes } = await request.json()
    const ideaId = params.id

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a manager
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers can make decisions' }, { status: 403 })
    }

    // Validate required fields
    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json(
        { error: 'Valid decision (approved/rejected) is required' },
        { status: 400 }
      )
    }

    // Start transaction
    const { data: existingDecision } = await supabase
      .from('manager_decisions')
      .select('id')
      .eq('idea_id', ideaId)
      .single()

    if (existingDecision) {
      return NextResponse.json(
        { error: 'Decision already exists for this idea' },
        { status: 400 }
      )
    }

    // Insert decision
    const { data: managerDecision, error: decisionError } = await supabase
      .from('manager_decisions')
      .insert({
        idea_id: ideaId,
        manager_id: user.id,
        decision,
        funding_amount: decision === 'approved' ? funding_amount : null,
        competitor_analysis,
        notes
      })
      .select()
      .single()

    if (decisionError) {
      return NextResponse.json({ error: decisionError.message }, { status: 400 })
    }

    // Update idea status
    const newStatus = decision === 'approved' ? 'funded' : 'rejected'
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ status: newStatus })
      .eq('id', ideaId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: `Idea ${decision} successfully`,
      decision: managerDecision
    })
  } catch (error) {
    console.error('Decision error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}