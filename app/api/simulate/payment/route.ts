import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, method } = body

    if (!projectId || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        projectId,
        amount: project.price,
        method,
        status: 'confirmed',
        transactionRef: `TXN${nanoid(8)}`,
        confirmedAt: new Date(),
      },
    })

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'paid' },
    })

    // Simulate password delivery
    const deliveryMethods = ['email', 'sms', 'whatsapp']
    await Promise.all(
      deliveryMethods.map((deliveryMethod) =>
        prisma.deliveryLog.create({
          data: {
            projectId,
            method: deliveryMethod,
            status: 'sent',
            message: `Password sent via ${deliveryMethod} (SIMULATED)`,
          },
        })
      )
    )

    // Update project status to delivered
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'delivered' },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and password delivered',
      payment,
    })
  } catch (error) {
    console.error('Error simulating payment:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
