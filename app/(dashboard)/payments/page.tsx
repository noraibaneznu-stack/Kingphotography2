'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  price: number
  status: string
  client: { name: string }
}

export default function PaymentsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimulatePayment = async (projectId: string, method: string) => {
    setProcessingPayment(projectId)
    try {
      const res = await fetch('/api/simulate/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, method }),
      })

      if (res.ok) {
        toast.success('Payment confirmed! Password automatically delivered to client via Email, SMS, and WhatsApp.')
        fetchProjects()
      } else {
        toast.error('Failed to process payment')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setProcessingPayment(null)
    }
  }

  const pendingProjects = projects.filter(p => p.status === 'pending')
  const paidProjects = projects.filter(p => p.status !== 'pending')

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-2">Track and simulate payments for projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <h3 className="text-2xl font-bold mt-2">{pendingProjects.length}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <h3 className="text-2xl font-bold mt-2">{paidProjects.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(pendingProjects.reduce((sum, p) => sum + p.price, 0))}
                </h3>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>Projects awaiting payment confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Simulate Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client.name}</TableCell>
                  <TableCell>{formatCurrency(project.price)}</TableCell>
                  <TableCell>
                    <Badge variant="warning">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSimulatePayment(project.id, 'mpesa')}
                        disabled={processingPayment === project.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        M-Pesa
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSimulatePayment(project.id, 'paypal')}
                        disabled={processingPayment === project.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        PayPal
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSimulatePayment(project.id, 'bank')}
                        disabled={processingPayment === project.id}
                        variant="outline"
                      >
                        Bank
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pendingProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pending payments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Payments</CardTitle>
          <CardDescription>Projects with confirmed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client.name}</TableCell>
                  <TableCell>{formatCurrency(project.price)}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'delivered' ? 'success' : 'info'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paidProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No completed payments yet
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-blue-700">Demo Mode</p>
            <p className="text-xs text-blue-600 mt-1">
              Click any payment method button to simulate payment confirmation. The system will automatically deliver the password to the client via Email, SMS, and WhatsApp (simulated).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
