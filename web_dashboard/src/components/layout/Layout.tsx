import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isLoggedIn && router.pathname !== '/login') {
      router.push('/login')
    }
  }, [isLoggedIn, loading, router])

  // Don't show layout on login page
  if (router.pathname === '/login') {
    return <>{children}</>
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-dark-muted">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout if not authenticated
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
