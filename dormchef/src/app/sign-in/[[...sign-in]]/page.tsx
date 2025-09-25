import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your DormChef account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
              card: 'bg-gray-800 border-gray-700',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'border-gray-600 text-white hover:bg-gray-700',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-gray-700 border-gray-600 text-white',
              footerActionLink: 'text-orange-400 hover:text-orange-300',
            }
          }}
        />
      </div>
    </div>
  )
}