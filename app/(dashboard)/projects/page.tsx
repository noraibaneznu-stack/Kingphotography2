'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
}

interface Project {
  id: string
  name: string
  contentLink: string
  password: string
  price: number
  status: string
  client: Client
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  
  const [formData, setFormData] = useState({
    name: '',
    contentLink: '',
    clientId: '',
    price: '',
  })

  useEffect(() => {
    fetchProjects()
    fetchClients()
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

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (error) {
      toast.error('Failed to fetch clients')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Project created successfully!')
        setShowModal(false)
        setFormData({ name: '', contentLink: '', clientId: '', price: '' })
        fetchProjects()
      } else {
        toast.error('Failed to create project')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Project deleted successfully!')
        fetchProjects()
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const togglePasswordVisibility = (projectId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-2">Manage your photography projects and content links</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>A list of all your photography projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <a 
                        href={project.contentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        View Content <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{project.client.name}</TableCell>
                  <TableCell>{formatCurrency(project.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {showPasswords[project.id] ? project.password : '••••••••••••'}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(project.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords[project.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(project.password)}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        project.status === 'delivered'
                          ? 'success'
                          : project.status === 'paid'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {projects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects yet. Create your first project!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Add a new photography project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Wedding Album - John & Jane"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentLink">Content Link</Label>
                  <Input
                    id="contentLink"
                    type="url"
                    value={formData.contentLink}
                    onChange={(e) => setFormData({ ...formData, contentLink: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <select
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15000"
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-700">
                  <p className="font-semibold">Note:</p>
                  <p>A secure password will be automatically generated for this project.</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Project</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
