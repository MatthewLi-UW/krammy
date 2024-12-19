// app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <div className="text-indigo-600 font-bold text-2xl">KeyCram</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Learn Faster,{' '}
            <span className="text-indigo-600">Type Smarter</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your study notes into interactive typing exercises. 
            Master your material while improving your typing speed.
          </p>
          <div className="mt-10">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center space-x-2"
            >
              Start Learning Free
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Note Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes your notes and creates personalized study materials.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Type to Memorize</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Boost retention through active recall and typing exercises.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your improvement with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold">Ready to revolutionize your study routine?</h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of students who are already learning faster and remembering more.
          </p>
          <div className="mt-10">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-between items-center">
          <div className="font-bold text-xl">KeyCram</div>
          <p className="text-sm text-gray-500">© 2024 KeyCram. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}