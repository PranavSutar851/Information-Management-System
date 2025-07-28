import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a manager
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers can make decisions' }, { status: 403 })
    }

    const body = await request.json()
    const { decision, funding_amount, competitor_analysis, notes } = body

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Valid decision required' }, { status: 400 })
    }

    // Create manager decision record
    const { data: managerDecision, error: decisionError } = await supabase
      .from('manager_decisions')
      .insert({
        idea_id: params.id,
        manager_id: user.id,
        decision,
        funding_amount: decision === 'approved' ? funding_amount : null,
        competitor_analysis,
        notes,
      })
      .select()
      .single()

    if (decisionError) {
      console.error('Error creating manager decision:', decisionError)
      return NextResponse.json({ error: 'Failed to save decision' }, { status: 500 })
    }

    // Update idea status
    const newStatus = decision === 'approved' ? 'funded' : 'rejected'
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ status: newStatus })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating idea status:', updateError)
      return NextResponse.json({ error: 'Failed to update idea status' }, { status: 500 })
    }

    return NextResponse.json({ decision: managerDecision })
  } catch (error) {
    console.error('Error in POST /api/ideas/[id]/decision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}