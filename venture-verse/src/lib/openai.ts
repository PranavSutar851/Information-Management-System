import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface AIAssessment {
  innovation: number
  market_fit: number
  team_strength: number
  revenue_potential: number
  overall_score: number
  recommendations: string[]
  strengths: string[]
  concerns: string[]
}

export async function assessIdea(
  title: string,
  description: string,
  category: string,
  marketSize: string,
  businessModel: string
): Promise<AIAssessment> {
  const prompt = `
You are an expert venture capitalist evaluating startup ideas. Please assess the following startup idea and provide a detailed evaluation.

Startup Idea:
Title: ${title}
Description: ${description}
Category: ${category}
Market Size: ${marketSize}
Business Model: ${businessModel}

Please evaluate this idea on the following criteria (score each from 0-100):
1. Innovation: How novel and innovative is this idea?
2. Market Fit: How well does this solve a real market problem?
3. Team Strength: Based on the idea presentation, how likely is success?
4. Revenue Potential: How strong is the revenue potential?

Provide your response in the following JSON format:
{
  "innovation": <score 0-100>,
  "market_fit": <score 0-100>,
  "team_strength": <score 0-100>,
  "revenue_potential": <score 0-100>,
  "overall_score": <calculated average>,
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"]
}

Be thorough but concise in your recommendations, strengths, and concerns.
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert venture capitalist with 20+ years of experience evaluating startup ideas. Provide honest, constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const assessment = JSON.parse(response) as AIAssessment
    
    // Ensure overall_score is calculated correctly
    assessment.overall_score = Math.round(
      (assessment.innovation + assessment.market_fit + assessment.team_strength + assessment.revenue_potential) / 4
    )

    return assessment
  } catch (error) {
    console.error('Error assessing idea with OpenAI:', error)
    // Return a default assessment if AI fails
    return {
      innovation: 50,
      market_fit: 50,
      team_strength: 50,
      revenue_potential: 50,
      overall_score: 50,
      recommendations: ['Unable to generate AI recommendations at this time'],
      strengths: ['Idea submitted successfully'],
      concerns: ['AI assessment temporarily unavailable']
    }
  }
}

export default openai