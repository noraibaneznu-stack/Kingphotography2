import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = (session.user as any).id
    const body = await req.json()
    const { projectId, method, phoneNumber } = body

    if (!projectId || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project belongs to client
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        projectId,
        amount: project.price,
        method,
        phoneNumber: phoneNumber || null,
        status: 'pending',
      },
    })

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id,
      message: 'Payment initiated successfully' 
    })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
