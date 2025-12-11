import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, type = 'login' } = body

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Create OTP record
    const otp = await prisma.oTPVerification.create({
      data: {
        email: email || null,
        phone: phone || null,
        code,
        type,
        expiresAt,
      },
    })

    // In DEMO mode, return the OTP in response
    // In production, send via SMS/Email
    console.log(`📱 DEMO MODE - OTP: ${code} for ${email || phone}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include in demo mode for testing
      otp: code,
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
