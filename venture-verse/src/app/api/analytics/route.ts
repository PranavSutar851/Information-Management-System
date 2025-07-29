import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

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
      return NextResponse.json({ error: 'Only managers can access analytics' }, { status: 403 })
    }

    // Get overall statistics
    const { data: totalIdeas } = await supabase
      .from('ideas')
      .select('id', { count: 'exact' })

    const { data: pendingReview } = await supabase
      .from('ideas')
      .select('id', { count: 'exact' })
      .eq('status', 'under_review')

    const { data: approved } = await supabase
      .from('ideas')
      .select('id', { count: 'exact' })
      .eq('status', 'funded')

    const { data: rejected } = await supabase
      .from('ideas')
      .select('id', { count: 'exact' })
      .eq('status', 'rejected')

    // Get average AI score
    const { data: avgScoreData } = await supabase
      .from('ideas')
      .select('ai_score')
      .not('ai_score', 'is', null)

    const averageScore = avgScoreData?.length 
      ? Math.round(avgScoreData.reduce((sum, idea) => sum + (idea.ai_score || 0), 0) / avgScoreData.length)
      : 0

    // Get category statistics
    const { data: categoryStats } = await supabase
      .from('ideas')
      .select('category, ai_score')

    const categoryData = categoryStats?.reduce((acc, idea) => {
      if (!acc[idea.category]) {
        acc[idea.category] = { count: 0, totalScore: 0, scores: [] }
      }
      acc[idea.category].count++
      if (idea.ai_score) {
        acc[idea.category].totalScore += idea.ai_score
        acc[idea.category].scores.push(idea.ai_score)
      }
      return acc
    }, {} as Record<string, { count: number; totalScore: number; scores: number[] }>)

    const categories = Object.entries(categoryData || {}).map(([category, data]) => ({
      category,
      count: data.count,
      average_score: data.scores.length ? Math.round(data.totalScore / data.scores.length) : 0
    }))

    // Get recent ideas
    const { data: recentIdeas } = await supabase
      .from('ideas_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get funding statistics
    const { data: fundingData } = await supabase
      .from('manager_decisions')
      .select('funding_amount')
      .eq('decision', 'approved')
      .not('funding_amount', 'is', null)

    const totalFunding = fundingData?.reduce((sum, decision) => sum + (decision.funding_amount || 0), 0) || 0

    const stats = {
      total_ideas: totalIdeas?.length || 0,
      pending_review: pendingReview?.length || 0,
      approved: approved?.length || 0,
      rejected: rejected?.length || 0,
      average_score: averageScore,
      total_funding: totalFunding,
      categories,
      recent_ideas: recentIdeas || []
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}