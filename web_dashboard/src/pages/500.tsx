import Head from 'next/head'
import Link from 'next/link'
import Button from '@/components/common/Button'

export default function ServerError() {
  return (
    <>
      <Head>
        <title>500 - Server Error</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gradient">500</h1>
            <h2 className="text-2xl font-semibold text-dark-text mt-4">Server Error</h2>
            <p className="text-dark-muted mt-2">
              Something went wrong on our end. Please try again later.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
