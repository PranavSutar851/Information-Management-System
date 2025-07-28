import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, DollarSign, Lightbulb, Target } from 'lucide-react'

async function getAnalyticsData(supabase: any) {
  try {
    // Get all ideas with their data
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select(`
        *,
        users!ideas_founder_id_fkey(name, email),
        manager_decisions(decision, funding_amount)
      `)

    if (ideasError) throw ideasError

    // Get funding decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('manager_decisions')
      .select('*')

    if (decisionsError) throw decisionsError

    return { ideas: ideas || [], decisions: decisions || [] }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return { ideas: [], decisions: [] }
  }
}

function calculateStats(ideas: any[], decisions: any[]) {
  const totalIdeas = ideas.length
  const submittedIdeas = ideas.filter(idea => idea.status === 'submitted').length
  const fundedIdeas = ideas.filter(idea => idea.status === 'funded').length
  const rejectedIdeas = ideas.filter(idea => idea.status === 'rejected').length
  
  const totalFunding = decisions
    .filter(d => d.decision === 'approved')
    .reduce((sum, d) => sum + (d.funding_amount || 0), 0)
  
  const avgAiScore = ideas.length > 0 
    ? Math.round(ideas.reduce((sum, idea) => sum + (idea.ai_score || 0), 0) / ideas.length)
    : 0

  const approvalRate = totalIdeas > 0 ? Math.round((fundedIdeas / totalIdeas) * 100) : 0

  // Category breakdown
  const categoryStats = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Status breakdown
  const statusStats = {
    submitted: submittedIdeas,
    funded: fundedIdeas,
    rejected: rejectedIdeas
  }

  return {
    totalIdeas,
    submittedIdeas,
    fundedIdeas,
    rejectedIdeas,
    totalFunding,
    avgAiScore,
    approvalRate,
    categoryStats,
    statusStats
  }
}

export default async function AnalyticsPage() {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }

  // Get user data and verify they're a manager
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'manager') {
    redirect('/dashboard')
  }

  const { ideas, decisions } = await getAnalyticsData(supabase)
  const stats = calculateStats(ideas, decisions)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive insights into idea submissions and funding decisions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalFunding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Approved funding amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              Ideas approved for funding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAiScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Average AI assessment score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Idea Status Breakdown</CardTitle>
            <CardDescription>Current status of all submitted ideas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Submitted</Badge>
                <span className="text-sm text-gray-600">Awaiting review</span>
              </div>
              <span className="font-semibold">{stats.statusStats.submitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="success">Funded</Badge>
                <span className="text-sm text-gray-600">Approved & funded</span>
              </div>
              <span className="font-semibold">{stats.statusStats.funded}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Rejected</Badge>
                <span className="text-sm text-gray-600">Not approved</span>
              </div>
              <span className="font-semibold">{stats.statusStats.rejected}</span>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ideas by Category</CardTitle>
            <CardDescription>Distribution of ideas across different categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.categoryStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(count / stats.totalIdeas) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest ideas submitted for review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ideas
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      by {idea.users.name || idea.users.email} • {idea.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {idea.ai_score && (
                      <div className="text-center">
                        <div className="text-sm font-semibold text-primary">
                          {idea.ai_score}/100
                        </div>
                        <div className="text-xs text-gray-500">AI Score</div>
                      </div>
                    )}
                    <Badge 
                      variant={
                        idea.status === 'funded' ? 'success' :
                        idea.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {idea.status === 'submitted' ? 'Submitted' :
                       idea.status === 'funded' ? 'Funded' : 'Rejected'}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}