'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ManagerDecisionProps {
  ideaId: string
  currentStatus: string
}

export default function ManagerDecision({ ideaId, currentStatus }: ManagerDecisionProps) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)
  const [fundingAmount, setFundingAmount] = useState('')
  const [competitorAnalysis, setCompetitorAnalysis] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Don't show if already decided
  if (currentStatus === 'funded' || currentStatus === 'rejected') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant={currentStatus === 'funded' ? 'success' : 'destructive'} className="mb-2">
              {currentStatus === 'funded' ? 'Approved & Funded' : 'Rejected'}
            </Badge>
            <p className="text-sm text-gray-600">
              This idea has already been {currentStatus === 'funded' ? 'approved' : 'rejected'}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!decision) return

    setLoading(true)

    try {
      const response = await fetch(`/api/ideas/${ideaId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          funding_amount: decision === 'approved' ? parseFloat(fundingAmount) || 0 : null,
          competitor_analysis: competitorAnalysis || null,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit decision')
      }

      setSubmitted(true)
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error('Error submitting decision:', error)
      alert('Failed to submit decision: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Decision Submitted!</h3>
            <p className="text-sm text-gray-600">
              Your decision has been recorded and the founder will be notified.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Decision</CardTitle>
        <CardDescription>
          Review the idea and AI assessment to make your funding decision.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Decision Buttons */}
          <div className="space-y-3">
            <Label>Decision *</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={decision === 'approved' ? 'default' : 'outline'}
                onClick={() => setDecision('approved')}
                className="flex-1"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Fund
              </Button>
              <Button
                type="button"
                variant={decision === 'rejected' ? 'destructive' : 'outline'}
                onClick={() => setDecision('rejected')}
                className="flex-1"
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>

          {/* Funding Amount (only if approved) */}
          {decision === 'approved' && (
            <div className="space-y-2">
              <Label htmlFor="funding_amount">Funding Amount ($) *</Label>
              <Input
                id="funding_amount"
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="Enter funding amount"
                required
                disabled={loading}
                min="0"
                step="1000"
              />
            </div>
          )}

          {/* Competitor Analysis */}
          <div className="space-y-2">
            <Label htmlFor="competitor_analysis">Competitor Analysis</Label>
            <Textarea
              id="competitor_analysis"
              value={competitorAnalysis}
              onChange={(e) => setCompetitorAnalysis(e.target.value)}
              placeholder="Analyze the competitive landscape and positioning..."
              disabled={loading}
              rows={4}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional feedback or reasoning for your decision..."
              disabled={loading}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!decision || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Decision
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}