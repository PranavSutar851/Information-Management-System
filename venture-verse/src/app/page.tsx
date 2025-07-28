import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Brain, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">Venture Verse</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Your Startup Ideas Into
            <span className="text-primary block">Funded Reality</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Submit your startup ideas, get instant AI assessment, and connect with managers 
            ready to fund the next big thing. The future of startup funding is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-4">
                Submit Your Idea
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Sign In as Manager
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Venture Verse Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform streamlines the entire process from idea submission to funding decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Submit Your Idea</CardTitle>
                <CardDescription>
                  Share your startup concept with detailed information about your vision, market, and business model.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>AI Assessment</CardTitle>
                <CardDescription>
                  Our advanced AI evaluates your idea across multiple criteria and provides detailed feedback and recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Get Funded</CardTitle>
                <CardDescription>
                  Qualified managers review your idea and AI assessment to make informed funding decisions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Venture Verse?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Instant AI Feedback</h3>
                    <p className="text-gray-600">Get immediate, comprehensive analysis of your startup idea.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Manager Review</h3>
                    <p className="text-gray-600">Connect with experienced managers ready to fund great ideas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Streamlined Process</h3>
                    <p className="text-gray-600">From submission to funding decision in record time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                    <p className="text-gray-600">Monitor your idea&apos;s progress through every stage.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl p-8">
              <div className="text-center">
                <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Join the Community</h3>
                <p className="text-gray-600 mb-6">
                  Connect with innovative founders and forward-thinking managers in our growing ecosystem.
                </p>
                <Link href="/auth/signup">
                  <Button size="lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Startup Idea?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of founders who have already submitted their ideas and received funding through our platform.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Lightbulb className="h-6 w-6" />
              <span className="text-xl font-bold">Venture Verse</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Venture Verse. Built for Edge Company. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
