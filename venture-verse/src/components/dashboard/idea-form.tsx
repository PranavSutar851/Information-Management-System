'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Lightbulb } from 'lucide-react'

const categories = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Entertainment',
  'Social Impact',
  'Sustainability',
  'Food & Beverage',
  'Travel',
  'Other'
]

const marketSizes = [
  'Small (< $1M)',
  'Medium ($1M - $10M)',
  'Large ($10M - $100M)',
  'Very Large ($100M - $1B)',
  'Massive (> $1B)'
]

const businessModels = [
  'B2B SaaS',
  'B2C Subscription',
  'Marketplace',
  'E-commerce',
  'Freemium',
  'Advertising',
  'Transaction-based',
  'Licensing',
  'Consulting',
  'Other'
]

export default function IdeaForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    market_size: '',
    business_model: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit idea')
      }

      const result = await response.json()
      setSuccess(true)
      
      // Redirect to idea detail page after a short delay
      setTimeout(() => {
        router.push(`/idea/${result.idea.id}`)
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Idea Submitted Successfully!</h3>
            <p className="text-sm text-gray-600">
              Your idea has been submitted and assessed by our AI. You&apos;ll be redirected to view the results.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Startup Idea</CardTitle>
        <CardDescription>
          Fill out the form below to submit your startup idea for AI assessment and manager review.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Idea Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a catchy title for your idea"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your startup idea in detail. What problem does it solve? How does it work?"
              required
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
                disabled={loading}
              >
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
              <Label htmlFor="market_size">Market Size *</Label>
              <Select
                value={formData.market_size}
                onValueChange={(value) => handleInputChange('market_size', value)}
                required
                disabled={loading}
              >
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
            <Select
              value={formData.business_model}
              onValueChange={(value) => handleInputChange('business_model', value)}
              required
              disabled={loading}
            >
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Idea for Assessment
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}