'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

interface Idea {
  id: string
  title: string
  description: string
  category: string
  market_size: string
  business_model: string
  status: 'submitted' | 'under_review' | 'funded' | 'rejected'
  ai_score: number | null
  created_at: string
  users?: {
    name: string | null
    email: string
  }
}

interface IdeasListProps {
  userRole: 'founder' | 'manager'
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

export default function IdeasList({ userRole }: IdeasListProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchIdeas = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`/api/ideas?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }

      const data = await response.json()
      setIdeas(data.ideas)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [statusFilter, categoryFilter])

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading ideas: {error}</p>
        <Button onClick={fetchIdeas} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="E-commerce">E-commerce</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No ideas found</p>
          {userRole === 'founder' && (
            <p className="text-gray-400 mt-2">
              Submit your first idea to get started!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {idea.title}
                      </CardTitle>
                      {userRole === 'manager' && idea.users && (
                        <CardDescription className="mt-1">
                          by {idea.users.name || idea.users.email}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={statusColors[idea.status]}>
                      {statusLabels[idea.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {idea.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{idea.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Market Size:</span>
                      <span className="font-medium">{idea.market_size}</span>
                    </div>
                    {idea.ai_score && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">AI Score:</span>
                        <span className="font-medium text-primary">
                          {idea.ai_score}/100
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/idea/${idea.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}