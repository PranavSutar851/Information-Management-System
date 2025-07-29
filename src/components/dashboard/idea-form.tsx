'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Brain, TrendingUp, Users, DollarSign } from 'lucide-react'
import { AIAssessmentResponse } from '@/lib/types'
import { getScoreColor } from '@/lib/utils'

interface IdeaFormProps {
  onIdeaSubmitted: () => void
}

const categories = [
  'Technology & Software',
  'Healthcare & Wellness', 
  'Education & Training',
  'Finance & Fintech',
  'E-commerce & Retail',
  'Food & Beverage',
  'Transportation & Logistics',
  'Real Estate & PropTech',
  'Entertainment & Media',
  'Agriculture & FoodTech',
  'Energy & Environment',
  'Manufacturing & IoT',
  'Other'
]

const marketSizes = [
  'Under $1B',
  '$1B - $10B',
  '$10B - $50B',
  '$50B - $100B',
  'Over $100B'
]

const businessModels = [
  'B2B SaaS',
  'B2C Subscription',
  'Marketplace',
  'E-commerce',
  'Freemium',
  'Transaction-based',
  'Advertising',
  'Hardware + Software',
  'Consulting/Services',
  'Other'
]

export function IdeaForm({ onIdeaSubmitted }: IdeaFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [assessment, setAssessment] = useState<AIAssessmentResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setAssessment(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      market_size: formData.get('market_size') as string,
      business_model: formData.get('business_model') as string,
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit idea')
      }

      setAssessment(result.assessment)
      onIdeaSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setAssessment(null)
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Submit New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Startup Idea</DialogTitle>
          <DialogDescription>
            Share your innovative idea and get instant AI-powered assessment and feedback.
          </DialogDescription>
        </DialogHeader>

        {!assessment ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., EcoDelivery - Sustainable Last-Mile Delivery"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your startup idea, the problem it solves, and your solution approach..."
                className="min-h-[100px]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="market_size">Target Market Size *</Label>
                <Select name="market_size" required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market size" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_model">Business Model *</Label>
              <Select name="business_model" required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business model" />
                </SelectTrigger>
                <SelectContent>
                  {businessModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Assessment
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">AI Assessment Complete!</h3>
              <p className="text-muted-foreground">Your idea has been evaluated and submitted for review.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Overall Score
                  <Badge variant="secondary" className="text-lg">
                    <span className={getScoreColor(assessment.overall_score)}>
                      {assessment.overall_score}/100
                    </span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Innovation</span>
                    <span className={`text-sm font-medium ${getScoreColor(assessment.scores.innovation)}`}>
                      {assessment.scores.innovation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Market Fit</span>
                    <span className={`text-sm font-medium ${getScoreColor(assessment.scores.market_fit)}`}>
                      {assessment.scores.market_fit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Team Strength</span>
                    <span className={`text-sm font-medium ${getScoreColor(assessment.scores.team_strength)}`}>
                      {assessment.scores.team_strength}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Revenue Potential</span>
                    <span className={`text-sm font-medium ${getScoreColor(assessment.scores.revenue_potential)}`}>
                      {assessment.scores.revenue_potential}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{assessment.analysis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assessment.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}