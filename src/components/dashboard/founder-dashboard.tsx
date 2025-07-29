'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, Clock, CheckCircle, XCircle, Brain } from 'lucide-react'
import { User, IdeaWithDetails } from '@/lib/types'
import { IdeaForm } from './idea-form'
import { IdeaCard } from './idea-card'

interface FounderDashboardProps {
  user: User
}

export function FounderDashboard({ user }: FounderDashboardProps) {
  const [ideas, setIdeas] = useState<IdeaWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas')
      if (response.ok) {
        const data = await response.json()
        setIdeas(data.ideas || [])
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const handleIdeaSubmitted = () => {
    fetchIdeas()
  }

  // Calculate stats
  const totalIdeas = ideas.length
  const submittedIdeas = ideas.filter(idea => idea.status === 'submitted').length
  const underReviewIdeas = ideas.filter(idea => idea.status === 'under_review').length
  const fundedIdeas = ideas.filter(idea => idea.status === 'funded').length
  const rejectedIdeas = ideas.filter(idea => idea.status === 'rejected').length
  const averageScore = ideas.length > 0 
    ? Math.round(ideas.reduce((sum, idea) => sum + (idea.ai_score || 0), 0) / ideas.length)
    : 0

  // Filter ideas based on active tab
  const filteredIdeas = activeTab === 'all' 
    ? ideas 
    : ideas.filter(idea => idea.status === activeTab)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Ready to turn your next big idea into reality?
          </p>
        </div>
        <IdeaForm onIdeaSubmitted={handleIdeaSubmitted} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIdeas}</div>
            <p className="text-xs text-muted-foreground">
              Ideas submitted to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewIdeas}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting manager decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funded</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fundedIdeas}</div>
            <p className="text-xs text-muted-foreground">
              Successfully funded ideas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Average assessment score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ideas Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Ideas</CardTitle>
          <CardDescription>
            Track the progress of your submitted ideas and their AI assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({totalIdeas})
              </TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted ({submittedIdeas})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                Review ({underReviewIdeas})
              </TabsTrigger>
              <TabsTrigger value="funded">
                Funded ({fundedIdeas})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedIdeas})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIdeas.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'all' 
                      ? 'No ideas yet' 
                      : `No ${activeTab.replace('_', ' ')} ideas`
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all'
                      ? 'Submit your first startup idea to get started with AI-powered assessment'
                      : `You don't have any ${activeTab.replace('_', ' ')} ideas yet`
                    }
                  </p>
                  {activeTab === 'all' && (
                    <IdeaForm onIdeaSubmitted={handleIdeaSubmitted} />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}