import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { FounderDashboard } from '@/components/dashboard/founder-dashboard'
import { ManagerDashboard } from '@/components/dashboard/manager-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Get user profile with role
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !userProfile) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userProfile} />
      <main className="container mx-auto px-4 py-8">
        {userProfile.role === 'founder' ? (
          <FounderDashboard user={userProfile} />
        ) : (
          <ManagerDashboard user={userProfile} />
        )}
      </main>
    </div>
  )
}