import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dummyUsers = [
  {
    email: 'john.founder@example.com',
    password: 'password123',
    name: 'John Founder',
    role: 'founder'
  },
  {
    email: 'jane.founder@example.com',
    password: 'password123',
    name: 'Jane Founder',
    role: 'founder'
  },
  {
    email: 'mike.manager@example.com',
    password: 'password123',
    name: 'Mike Manager',
    role: 'manager'
  },
  {
    email: 'sarah.manager@example.com',
    password: 'password123',
    name: 'Sarah Manager',
    role: 'manager'
  }
]

const dummyIdeas = [
  {
    title: 'EcoDelivery - Sustainable Last-Mile Delivery',
    description: 'A delivery service using electric bikes and drones to provide carbon-neutral last-mile delivery for e-commerce companies. Our platform optimizes routes using AI and partners with local businesses to create micro-fulfillment centers.',
    category: 'Logistics & Transportation',
    market_size: '$50B - Last-mile delivery market',
    business_model: 'B2B SaaS with per-delivery fees',
    status: 'under_review'
  },
  {
    title: 'MindfulAI - Mental Health Companion',
    description: 'An AI-powered mental health companion that provides personalized therapy sessions, mood tracking, and crisis intervention. Uses natural language processing to understand user emotions and provides evidence-based therapeutic interventions.',
    category: 'Healthcare & Wellness',
    market_size: '$6B - Digital mental health market',
    business_model: 'Subscription-based with tiered pricing',
    status: 'submitted'
  },
  {
    title: 'SkillSwap - Professional Development Platform',
    description: 'A platform connecting professionals for skill exchange and mentorship. Users can trade expertise, attend virtual workshops, and get certified in new skills through peer-to-peer learning.',
    category: 'Education & Training',
    market_size: '$15B - Corporate training market',
    business_model: 'Freemium with premium memberships',
    status: 'funded'
  },
  {
    title: 'FarmTech IoT - Smart Agriculture Solutions',
    description: 'IoT sensors and AI analytics for precision farming. Monitors soil conditions, weather patterns, and crop health to optimize irrigation, fertilization, and harvesting schedules.',
    category: 'Agriculture & Technology',
    market_size: '$12B - Precision agriculture market',
    business_model: 'Hardware sales + software subscription',
    status: 'rejected'
  },
  {
    title: 'VirtualOffice360 - Remote Work Platform',
    description: 'A comprehensive virtual office platform with immersive VR meeting spaces, collaborative workspaces, and productivity tracking tools designed for distributed teams.',
    category: 'Remote Work & Collaboration',
    market_size: '$8B - Remote work software market',
    business_model: 'Per-seat monthly subscription',
    status: 'under_review'
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create users
    const createdUsers = []
    for (const userData of dummyUsers) {
      console.log(`Creating user: ${userData.email}`)
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          name: userData.name,
          role: userData.role
        },
        email_confirm: true
      })

      if (authError) {
        console.error(`Error creating user ${userData.email}:`, authError)
        continue
      }

      if (authData.user) {
        // Update user role in the users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: userData.role as any })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error(`Error updating user role for ${userData.email}:`, updateError)
        }

        createdUsers.push({
          id: authData.user.id,
          email: userData.email,
          role: userData.role
        })
      }
    }

    console.log(`✅ Created ${createdUsers.length} users`)

    // Get founder users for creating ideas
    const founders = createdUsers.filter(user => user.role === 'founder')
    
    if (founders.length === 0) {
      console.log('❌ No founders found, skipping idea creation')
      return
    }

    // Create ideas
    const createdIdeas = []
    for (let i = 0; i < dummyIdeas.length; i++) {
      const ideaData = dummyIdeas[i]
      const founder = founders[i % founders.length] // Rotate through founders
      
      console.log(`Creating idea: ${ideaData.title}`)

      // Generate mock AI scores
      const aiScores = {
        innovation: Math.floor(Math.random() * 40) + 60, // 60-100
        market_fit: Math.floor(Math.random() * 40) + 50, // 50-90
        team_strength: Math.floor(Math.random() * 30) + 60, // 60-90
        revenue_potential: Math.floor(Math.random() * 35) + 55 // 55-90
      }
      const overallScore = Math.floor(
        (aiScores.innovation + aiScores.market_fit + aiScores.team_strength + aiScores.revenue_potential) / 4
      )

      const aiRecommendations = {
        scores: aiScores,
        overall_score: overallScore,
        recommendations: [
          'Conduct thorough market research to validate demand',
          'Build a strong founding team with complementary skills',
          'Develop a minimum viable product for early testing',
          'Create a detailed financial model and funding strategy'
        ],
        analysis: 'This idea shows promise with strong innovation potential. Focus on market validation and team building to increase success probability.'
      }

      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .insert({
          founder_id: founder.id,
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category,
          market_size: ideaData.market_size,
          business_model: ideaData.business_model,
          status: ideaData.status,
          ai_score: overallScore,
          ai_recommendations: aiRecommendations
        })
        .select()
        .single()

      if (ideaError) {
        console.error(`Error creating idea ${ideaData.title}:`, ideaError)
        continue
      }

      if (idea) {
        // Create assessment
        const { error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            idea_id: idea.id,
            criteria: aiScores,
            overall_score: overallScore
          })

        if (assessmentError) {
          console.error(`Error creating assessment for ${ideaData.title}:`, assessmentError)
        }

        createdIdeas.push(idea)
      }
    }

    console.log(`✅ Created ${createdIdeas.length} ideas with assessments`)

    // Create some manager decisions for funded/rejected ideas
    const managers = createdUsers.filter(user => user.role === 'manager')
    if (managers.length > 0) {
      const fundedIdeas = createdIdeas.filter(idea => idea.status === 'funded')
      const rejectedIdeas = createdIdeas.filter(idea => idea.status === 'rejected')

      for (const idea of fundedIdeas) {
        const manager = managers[Math.floor(Math.random() * managers.length)]
        const { error: decisionError } = await supabase
          .from('manager_decisions')
          .insert({
            idea_id: idea.id,
            manager_id: manager.id,
            decision: 'approved',
            funding_amount: Math.floor(Math.random() * 500000) + 50000, // $50k-$550k
            competitor_analysis: 'Strong competitive position with unique value proposition. Market timing appears favorable.',
            notes: 'Impressed with the team and market opportunity. Recommend proceeding with Series A funding.'
          })

        if (decisionError) {
          console.error(`Error creating decision for funded idea:`, decisionError)
        }
      }

      for (const idea of rejectedIdeas) {
        const manager = managers[Math.floor(Math.random() * managers.length)]
        const { error: decisionError } = await supabase
          .from('manager_decisions')
          .insert({
            idea_id: idea.id,
            manager_id: manager.id,
            decision: 'rejected',
            competitor_analysis: 'Highly competitive market with established players. Differentiation unclear.',
            notes: 'While the idea has merit, the market is too crowded and the team lacks relevant experience.'
          })

        if (decisionError) {
          console.error(`Error creating decision for rejected idea:`, decisionError)
        }
      }

      console.log(`✅ Created manager decisions for funded and rejected ideas`)
    }

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📧 Test Accounts:')
    console.log('Founders:')
    console.log('- john.founder@example.com / password123')
    console.log('- jane.founder@example.com / password123')
    console.log('Managers:')
    console.log('- mike.manager@example.com / password123')
    console.log('- sarah.manager@example.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Run the seed function
seedDatabase()