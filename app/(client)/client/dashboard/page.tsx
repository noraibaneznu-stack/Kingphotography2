'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Lock, CheckCircle2, Clock, FolderOpen, LogOut, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PhotoGallery from '@/components/client/PhotoGallery'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  photoCount: number
  price: number
  status: string
  contentLink: string
  password: string
  createdAt: string
  payments: any[]
}

export default function ClientDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/client/login')
    } else if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/client/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      
      const data = await res.json()
      setProjects(data.projects)
      
      // Select first project by default
      if (data.projects.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
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

  if (!session) {
    return null
  }

  const stats = {
    total: projects.length,
    unlocked: projects.filter(p => p.status === 'paid' || p.status === 'delivered').length,
    pending: projects.filter(p => p.status === 'pending').length,
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; text: string }> = {
      pending: { variant: 'default', text: 'Payment Pending' },
      paid: { variant: 'default', text: 'Paid - Unlocked' },
      delivered: { variant: 'default', text: 'Delivered' },
    }
    const config = variants[status] || variants.pending
    
    return (
      <Badge 
        className={cn(
          status === 'pending' && 'bg-yellow-500',
          (status === 'paid' || status === 'delivered') && 'bg-accent'
        )}
      >
        {config.text}
      </Badge>
    )
  }

  const isProjectUnlocked = (project: Project) => {
    return project.status === 'paid' || project.status === 'delivered'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
        🎭 DEMO MODE - All payments and messaging are simulated
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <Link href="/client/dashboard" className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kingkidd</h1>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b bg-primary-50">
            <h2 className="text-lg font-semibold text-gray-900">Welcome back,</h2>
            <p className="text-primary font-medium">{session.user?.name}</p>
          </div>

          {/* Projects List */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Your Projects</h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    selectedProject?.id === project.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className={cn(
                        'text-xs mt-1',
                        selectedProject?.id === project.id ? 'text-primary-100' : 'text-gray-500'
                      )}>
                        {project.photoCount} photos
                      </p>
                    </div>
                    {isProjectUnlocked(project) ? (
                      <CheckCircle2 className={cn(
                        'h-5 w-5 flex-shrink-0 ml-2',
                        selectedProject?.id === project.id ? 'text-white' : 'text-accent'
                      )} />
                    ) : (
                      <Lock className={cn(
                        'h-5 w-5 flex-shrink-0 ml-2',
                        selectedProject?.id === project.id ? 'text-white' : 'text-gray-400'
                      )} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="absolute bottom-0 w-80 p-4 border-t">
            <button
              onClick={() => signOut({ callbackUrl: '/client/login' })}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
                <FolderOpen className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Unlocked Projects</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.unlocked}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Payment</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Project */}
          {selectedProject ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Created on {formatDate(selectedProject.createdAt)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedProject.status)}
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Photos</p>
                    <p className="text-lg font-semibold">{selectedProject.photoCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedProject.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-semibold capitalize">{selectedProject.status}</p>
                  </div>
                  {selectedProject.payments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="text-lg font-semibold">
                        {formatDate(selectedProject.payments[0].confirmedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isProjectUnlocked(selectedProject) ? (
                  <div className="space-y-4">
                    <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-accent-700">
                        <CheckCircle2 className="h-5 w-5" />
                        <p className="font-medium">Project Unlocked!</p>
                      </div>
                      <p className="text-sm text-accent-600 mt-1">
                        Your photos are ready to view and download.
                      </p>
                    </div>
                    
                    <PhotoGallery 
                      photos={[]} 
                      isLocked={false}
                      projectPassword={selectedProject.password}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Lock className="h-5 w-5" />
                        <p className="font-medium">Payment Required</p>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">
                        Complete payment to unlock and download your photos.
                      </p>
                    </div>

                    <PhotoGallery 
                      photos={[]} 
                      isLocked={true}
                    />

                    <div className="flex justify-center pt-4">
                      <Link href={`/client/payment/${selectedProject.id}`}>
                        <Button size="lg" className="px-8">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Proceed to Payment
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-gray-500">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No projects yet</p>
                  <p className="text-sm mt-2">Your photography projects will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
