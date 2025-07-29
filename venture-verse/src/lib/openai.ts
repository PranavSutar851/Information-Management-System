import OpenAI from 'openai'
import { AIAssessmentResponse } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function assessIdea(
  title: string,
  description: string,
  category: string,
  marketSize: string,
  businessModel: string
): Promise<AIAssessmentResponse> {
  const prompt = `
As an expert startup investor and venture capitalist, please assess the following startup idea and provide detailed scores and recommendations.

Startup Idea Details:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Market Size: ${marketSize}
- Business Model: ${businessModel}

Please evaluate this idea on the following criteria (score each from 0-100):

1. Innovation (0-100): How novel and innovative is this idea? Does it solve a problem in a new way?
2. Market Fit (0-100): How well does this idea fit the target market? Is there clear demand?
3. Team Strength (0-100): Based on the idea presentation, how likely is success given typical founder capabilities?
4. Revenue Potential (0-100): What's the potential for generating significant revenue?

Also provide:
- An overall score (0-100) that weighs all criteria
- 3-5 specific, actionable recommendations for improvement
- A brief analysis of strengths and potential challenges

Please respond in the following JSON format:
{
  "scores": {
    "innovation": <number>,
    "market_fit": <number>,
    "team_strength": <number>,
    "revenue_potential": <number>
  },
  "overall_score": <number>,
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "analysis": "<brief analysis of strengths and challenges>"
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert venture capitalist and startup advisor. Provide honest, constructive assessments of startup ideas with specific, actionable feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const assessment = JSON.parse(response) as AIAssessmentResponse
    
    // Validate the response structure
    if (!assessment.scores || !assessment.overall_score || !assessment.recommendations || !assessment.analysis) {
      throw new Error('Invalid assessment response structure')
    }

    return assessment
  } catch (error) {
    console.error('Error assessing idea with OpenAI:', error)
    
    // Return a fallback assessment if OpenAI fails
    return {
      scores: {
        innovation: 50,
        market_fit: 50,
        team_strength: 50,
        revenue_potential: 50
      },
      overall_score: 50,
      recommendations: [
        "Conduct thorough market research to validate demand",
        "Develop a detailed business plan with financial projections",
        "Build a minimum viable product to test with early users"
      ],
      analysis: "Assessment temporarily unavailable. Please review this idea manually."
    }
  }
}

export async function generateIdeaInsights(ideas: any[]): Promise<string> {
  const prompt = `
Analyze the following startup ideas and provide insights about trends, patterns, and recommendations for the portfolio:

Ideas Summary:
${ideas.map(idea => `- ${idea.title} (${idea.category}, Score: ${idea.ai_score || 'N/A'})`).join('\n')}

Provide insights about:
1. Common themes and trends
2. Strongest categories
3. Areas for improvement
4. Market opportunities

Keep the response concise and actionable.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a venture capital analyst providing portfolio insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || "Insights temporarily unavailable."
  } catch (error) {
    console.error('Error generating insights:', error)
    return "Unable to generate insights at this time."
  }
}