import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { clientAuthOptions } from '@/lib/client-auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(clientAuthOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Simulate payment processing delay (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Find payment and verify it belongs to the client
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const clientId = (session.user as any).id
    if (payment.project.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'confirmed',
        transactionRef: `TXN${nanoid(10)}`,
        confirmedAt: new Date(),
      },
    })

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: payment.projectId },
      data: {
        status: 'paid',
      },
    })

    // Create delivery logs (simulated)
    await prisma.deliveryLog.createMany({
      data: [
        {
          projectId: payment.projectId,
          method: 'email',
          status: 'sent',
          message: `Password sent to ${payment.project.client.email}`,
        },
        {
          projectId: payment.projectId,
          method: 'sms',
          status: 'sent',
          message: `Password sent to ${payment.project.client.phone}`,
        },
        {
          projectId: payment.projectId,
          method: 'whatsapp',
          status: 'sent',
          message: `Password sent to ${payment.project.client.whatsapp}`,
        },
      ],
    })

    console.log('📱 SIMULATED: Payment confirmed and notifications sent')

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      project: updatedProject,
      message: 'Payment confirmed successfully',
    })
  } catch (error) {
    console.error('Error simulating payment:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
