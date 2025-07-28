import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IdeaForm from '@/components/dashboard/idea-form'

export default async function SubmitIdeaPage() {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }

  // Get user data and verify they're a founder
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'founder') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your Startup Idea</h1>
        <p className="text-gray-600 mt-2">
          Share your innovative startup idea and get instant AI assessment
        </p>
      </div>
      
      <IdeaForm />
    </div>
  )
}