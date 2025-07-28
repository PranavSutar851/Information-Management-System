import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ManagerDecision from '@/components/dashboard/manager-decision'
import { ArrowLeft, Brain, TrendingUp, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

async function getIdeaDetails(supabase: any, ideaId: string) {
  const { data: idea, error } = await supabase
    .from('ideas')
    .select(`
      *,
      users!ideas_founder_id_fkey(name, email),
      manager_decisions(
        decision,
        funding_amount,
        competitor_analysis,
        notes,
        created_at,
        users!manager_decisions_manager_id_fkey(name, email)
      )
    `)
    .eq('id', ideaId)
    .single()

  if (error) return null
  return idea
}

const statusColors = {
  submitted: 'secondary',
  under_review: 'warning',
  funded: 'success',
  rejected: 'destructive'
} as const

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  funded: 'Funded',
  rejected: 'Rejected'
}

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
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

  const idea = await getIdeaDetails(supabase, params.id)
  
  if (!idea) {
    notFound()
  }

  // Check if user has permission to view this idea
  if (userData.role === 'founder' && idea.founder_id !== user.id) {
    redirect('/dashboard')
  }

  const aiRecommendations = idea.ai_recommendations as any

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant={statusColors[idea.status as keyof typeof statusColors]}>
              {statusLabels[idea.status as keyof typeof statusLabels]}
            </Badge>
            <span className="text-sm text-gray-600">
              Submitted by {idea.users.name || idea.users.email}
            </span>
            <span className="text-sm text-gray-400">
              on {new Date(idea.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Idea Details */}
          <Card>
            <CardHeader>
              <CardTitle>Idea Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">{idea.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-600">{idea.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Market Size</h4>
                  <p className="text-gray-600">{idea.market_size}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Business Model</h4>
                  <p className="text-gray-600">{idea.business_model}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assessment */}
          {aiRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Assessment
                </CardTitle>
                <CardDescription>
                  Artificial intelligence evaluation of your startup idea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {aiRecommendations.innovation}/100
                    </div>
                    <div className="text-sm text-blue-800">Innovation</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {aiRecommendations.market_fit}/100
                    </div>
                    <div className="text-sm text-green-800">Market Fit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {aiRecommendations.team_strength}/100
                    </div>
                    <div className="text-sm text-purple-800">Team Strength</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {aiRecommendations.revenue_potential}/100
                    </div>
                    <div className="text-sm text-orange-800">Revenue Potential</div>
                  </div>
                </div>

                {/* Recommendations */}
                {aiRecommendations.recommendations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths */}
                {aiRecommendations.strengths && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {aiRecommendations.concerns && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Areas of Concern
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.concerns.map((concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manager Decision (if exists) */}
          {idea.manager_decisions && idea.manager_decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Manager Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {idea.manager_decisions.map((decision: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={decision.decision === 'approved' ? 'success' : 'destructive'}>
                        {decision.decision === 'approved' ? 'Approved' : 'Rejected'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        by {decision.users.name || decision.users.email}
                      </span>
                      <span className="text-sm text-gray-400">
                        on {new Date(decision.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {decision.funding_amount && (
                      <div className="mb-2">
                        <span className="font-semibold">Funding Amount: </span>
                        <span className="text-green-600 font-bold">
                          ${decision.funding_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {decision.competitor_analysis && (
                      <div className="mb-2">
                        <h5 className="font-semibold mb-1">Competitor Analysis:</h5>
                        <p className="text-gray-700">{decision.competitor_analysis}</p>
                      </div>
                    )}
                    
                    {decision.notes && (
                      <div>
                        <h5 className="font-semibold mb-1">Notes:</h5>
                        <p className="text-gray-700">{decision.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Overall AI Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {idea.ai_score || 0}/100
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${idea.ai_score || 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manager Decision Form (for managers only) */}
          {userData.role === 'manager' && (
            <ManagerDecision ideaId={idea.id} currentStatus={idea.status} />
          )}
        </div>
      </div>
    </div>
  )
}