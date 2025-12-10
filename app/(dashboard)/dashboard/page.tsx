import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Users, CreditCard, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

async function getDashboardData() {
  const [
    totalProjects,
    pendingPayments,
    deliveredProjects,
    totalClients,
    recentProjects,
    recentDeliveries,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'pending' } }),
    prisma.project.count({ where: { status: 'delivered' } }),
    prisma.client.count(),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.deliveryLog.findMany({
      take: 5,
      orderBy: { sentAt: 'desc' },
      include: {
        project: {
          include: { client: true },
        },
      },
    }),
  ])

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'confirmed' },
    _sum: { amount: true },
  })

  return {
    totalProjects,
    pendingPayments,
    deliveredProjects,
    totalClients,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentProjects,
    recentDeliveries,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const data = await getDashboardData()

  const stats = [
    {
      title: 'Total Projects',
      value: data.totalProjects,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Payments',
      value: data.pendingPayments,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Delivered',
      value: data.deliveredProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Clients',
      value: data.totalClients,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {session.user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.client.name}</p>
                  </div>
                  <div className="text-right">
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
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(project.price)}</p>
                  </div>
                </div>
              ))}
              {data.recentProjects.length === 0 && (
                <p className="text-center text-gray-500 py-4">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Password Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{delivery.project.name}</p>
                    <p className="text-sm text-gray-500">{delivery.project.client.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={delivery.status === 'sent' ? 'success' : 'danger'}>
                      {delivery.method}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(delivery.sentAt)}</p>
                  </div>
                </div>
              ))}
              {data.recentDeliveries.length === 0 && (
                <p className="text-center text-gray-500 py-4">No deliveries yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
