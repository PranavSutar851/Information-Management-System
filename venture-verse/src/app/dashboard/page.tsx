import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import IdeasList from '@/components/dashboard/ideas-list'
import IdeaForm from '@/components/dashboard/idea-form'
import { Plus, Lightbulb, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats(supabase: any, userId: string, userRole: string) {
  if (userRole === 'founder') {
    // Get founder's ideas stats
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('status, ai_score')
      .eq('founder_id', userId)

    if (error) return null

    return {
      totalIdeas: ideas.length,
      fundedIdeas: ideas.filter((idea: any) => idea.status === 'funded').length,
      avgScore: ideas.length > 0 
        ? Math.round(ideas.reduce((sum: number, idea: any) => sum + (idea.ai_score || 0), 0) / ideas.length)
        : 0,
      pendingReview: ideas.filter((idea: any) => idea.status === 'submitted').length
    }
  } else {
    // Get manager's overview stats
    const [ideasResult, fundingResult] = await Promise.all([
      supabase
        .from('ideas')
        .select('status, ai_score'),
      supabase
        .from('manager_decisions')
        .select('funding_amount')
        .eq('decision', 'approved')
    ])

    if (ideasResult.error || fundingResult.error) return null

    const ideas = ideasResult.data
    const totalFunding = fundingResult.data.reduce((sum: number, decision: any) => 
      sum + (decision.funding_amount || 0), 0)

    return {
      totalIdeas: ideas.length,
      pendingReview: ideas.filter((idea: any) => idea.status === 'submitted').length,
      fundedIdeas: ideas.filter((idea: any) => idea.status === 'funded').length,
      totalFunding
    }
  }
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/auth/signin')
  }

  const stats = await getDashboardStats(supabase, user.id, userData.role)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData.name || userData.email}!
          </h1>
          <p className="text-gray-600 mt-1">
            {userData.role === 'founder' 
              ? 'Submit your startup ideas and track their progress'
              : 'Review and evaluate submitted startup ideas'
            }
          </p>
        </div>
        {userData.role === 'founder' && (
          <Link href="/dashboard/submit">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Submit New Idea</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Ideas
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIdeas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userData.role === 'founder' ? 'Pending Review' : 'Awaiting Review'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Funded Ideas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fundedIdeas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userData.role === 'founder' ? 'Avg AI Score' : 'Total Funding'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData.role === 'founder' 
                  ? `${stats.avgScore}/100`
                  : `$${stats.totalFunding?.toLocaleString() || 0}`
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {userData.role === 'founder' ? 'Your Ideas' : 'All Ideas'}
          </h2>
        </div>
        
        <IdeasList userRole={userData.role} />
      </div>
    </div>
  )
}