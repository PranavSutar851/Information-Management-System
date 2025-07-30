'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Menu, X, Lightbulb, BarChart3 } from 'lucide-react'

interface NavBarProps {
  user: {
    name: string | null
    email: string
    role: 'founder' | 'manager'
  }
}

export default function NavBar({ user }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Venture Verse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            {user.role === 'manager' && (
              <Link
                href="/dashboard/analytics"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            )}
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name || user.email}</p>
                <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user.role === 'manager' && (
                <Link
                  href="/dashboard/analytics"
                  className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Analytics
                </Link>
              )}
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <Badge variant={user.role === 'manager' ? 'default' : 'secondary'} className="mt-1">
                  {user.role}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start px-3"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}