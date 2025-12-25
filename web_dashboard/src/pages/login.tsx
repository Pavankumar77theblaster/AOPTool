import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { isAuthenticated } from '@/lib/auth'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      await login(data)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient">AOPTool</h1>
          <p className="mt-2 text-lg text-dark-muted">
            AI-Powered Autonomous Penetration Testing
          </p>
          <p className="mt-4 text-sm text-dark-text">
            Sign in to access the control panel
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-text mb-2">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className="input"
                placeholder="admin"
                autoComplete="username"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger-400">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-6 pt-6 border-t border-dark-border">
            <p className="text-xs text-dark-muted text-center">
              Default credentials: <span className="text-primary-400">admin</span> / <span className="text-primary-400">Admin@2025!Secure</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-dark-muted">
          <p>Authorized access only. All actions are logged.</p>
        </div>
      </div>
    </div>
  )
}
