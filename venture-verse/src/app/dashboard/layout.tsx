import { ReactNode } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/dashboard/nav-bar'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }

  // Get user data from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={userData} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}