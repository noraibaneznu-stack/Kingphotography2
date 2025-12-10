'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, MessageSquare, Smartphone } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DeliveryLog {
  id: string
  method: string
  status: string
  message: string
  sentAt: string
  project: {
    name: string
    client: {
      name: string
      email: string
    }
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<DeliveryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/projects')
      const projects = await res.json()
      
      // Extract all delivery logs using flatMap
      const allLogs: DeliveryLog[] = projects.flatMap((project: any) =>
        project.deliveryLogs.map((log: any) => ({
          ...log,
          project: {
            name: project.name,
            client: project.client,
          },
        }))
      )
      
      // Sort by sentAt descending
      allLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      setLogs(allLogs)
    } catch (error) {
      toast.error('Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-600" />
      case 'sms':
        return <Smartphone className="h-5 w-5 text-green-600" />
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5 text-green-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Delivery Logs</h1>
        <p className="text-gray-500 mt-2">Track all password deliveries to clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
            <h3 className="text-2xl font-bold mt-2">{logs.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Email</p>
            <h3 className="text-2xl font-bold mt-2">
              {logs.filter(l => l.method === 'email').length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">SMS</p>
            <h3 className="text-2xl font-bold mt-2">
              {logs.filter(l => l.method === 'sms').length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">WhatsApp</p>
            <h3 className="text-2xl font-bold mt-2">
              {logs.filter(l => l.method === 'whatsapp').length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Delivery Logs</CardTitle>
          <CardDescription>Complete history of password deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.project.name}</TableCell>
                  <TableCell>
                    <div>
                      <p>{log.project.client.name}</p>
                      <p className="text-xs text-gray-500">{log.project.client.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(log.method)}
                      <span className="capitalize">{log.method}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'sent' ? 'success' : 'danger'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{log.message}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(log.sentAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No delivery logs yet
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-green-700">Automated Delivery</p>
            <p className="text-xs text-green-600 mt-1">
              All password deliveries are automatically triggered when a payment is confirmed. The system sends passwords via Email, SMS, and WhatsApp simultaneously for maximum reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
