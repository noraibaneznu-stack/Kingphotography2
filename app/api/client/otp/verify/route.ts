import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, code } = body

    if (!code || (!email && !phone)) {
      return NextResponse.json({ error: 'Code and email/phone are required' }, { status: 400 })
    }

    // Find OTP verification
    const otp = await prisma.oTPVerification.findFirst({
      where: {
        code,
        OR: [
          { email: email || undefined },
          { phone: phone || undefined },
        ],
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // Mark as verified
    await prisma.oTPVerification.update({
      where: { id: otp.id },
      data: { verified: true },
    })

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
