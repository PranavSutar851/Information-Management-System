import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar, TrendingUp, Brain } from 'lucide-react'
import { IdeaWithDetails } from '@/lib/types'
import { formatDate, getStatusColor, getScoreColor } from '@/lib/utils'

interface IdeaCardProps {
  idea: IdeaWithDetails
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const statusColor = getStatusColor(idea.status)
  const scoreColor = idea.ai_score ? getScoreColor(idea.ai_score) : 'text-gray-500'

  return (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
      <Link href={`/idea/${idea.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                {idea.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {idea.description}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              <Badge className={statusColor} variant="secondary">
                {idea.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(idea.created_at)}</span>
            </div>
            <Badge variant="outline">{idea.category}</Badge>
          </div>

          {idea.ai_score && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">AI Score</span>
              </div>
              <div className={`text-lg font-bold ${scoreColor}`}>
                {idea.ai_score}/100
              </div>
            </div>
          )}

          {idea.manager_decision && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {idea.manager_decision.decision === 'approved' ? 'Funded' : 'Rejected'}
                </span>
                {idea.manager_decision.funding_amount && (
                  <span className="text-green-600 font-medium">
                    ${idea.manager_decision.funding_amount.toLocaleString()}
                  </span>
                )}
              </div>
              {idea.manager_decision.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {idea.manager_decision.notes}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </div>
            <TrendingUp className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}