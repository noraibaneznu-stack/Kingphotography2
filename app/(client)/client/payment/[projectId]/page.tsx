'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, CheckCircle2, Package, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PaymentMethods from '@/components/client/PaymentMethods'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  photoCount: number
  price: number
  status: string
  contentLink: string
  createdAt: string
}

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/client/login')
    } else if (status === 'authenticated') {
      fetchProject()
    }
  }, [status, router, projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch('/api/client/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      
      const data = await res.json()
      const proj = data.projects.find((p: Project) => p.id === projectId)
      
      if (!proj) {
        toast.error('Project not found')
        router.push('/client/dashboard')
        return
      }

      if (proj.status !== 'pending') {
        toast.error('This project has already been paid for')
        router.push('/client/dashboard')
        return
      }
      
      setProject(proj)
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/client/dashboard')
    }, 3000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !project) {
    return null
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="text-gray-600 mt-2">
                  Your photos have been unlocked and are ready to view.
                </p>
              </div>
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <p className="text-sm text-accent-700">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
        🎭 DEMO MODE - All payments are simulated
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Kingkidd Photography</h1>
                <p className="text-xs text-gray-500">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Preview */}
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                  <Package className="h-12 w-12 text-primary" />
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.photoCount} high-resolution photos
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(project.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium text-accent">KES 0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(project.price)}</span>
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-xs text-primary-700">
                    <strong>What you get:</strong>
                  </p>
                  <ul className="text-xs text-primary-600 mt-2 space-y-1">
                    <li>• Full access to all {project.photoCount} photos</li>
                    <li>• High-resolution downloads</li>
                    <li>• Lifetime access</li>
                    <li>• Secure cloud storage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method to complete your purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethods
                  projectId={project.id}
                  amount={project.price}
                  phoneNumber={(session.user as any)?.phone}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 bg-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                If you have any questions about payment or need assistance, please contact us at{' '}
                <a href="mailto:support@kingkidd.com" className="text-primary hover:underline">
                  support@kingkidd.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
