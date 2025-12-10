import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await hash('demo123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kingkidd.com' },
    update: {},
    create: {
      email: 'admin@kingkidd.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+254712345678',
        whatsapp: '+254712345678',
      },
    }),
    prisma.client.upsert({
      where: { email: 'sarah.wilson@example.com' },
      update: {},
      create: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+254723456789',
        whatsapp: '+254723456789',
      },
    }),
    prisma.client.upsert({
      where: { email: 'michael.brown@example.com' },
      update: {},
      create: {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+254734567890',
        whatsapp: '+254734567890',
      },
    }),
    prisma.client.upsert({
      where: { email: 'emily.davis@example.com' },
      update: {},
      create: {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+254745678901',
        whatsapp: '+254745678901',
      },
    }),
    prisma.client.upsert({
      where: { email: 'james.taylor@example.com' },
      update: {},
      create: {
        name: 'James Taylor',
        email: 'james.taylor@example.com',
        phone: '+254756789012',
        whatsapp: '+254756789012',
      },
    }),
  ])
  console.log(`✅ Created ${clients.length} clients`)

  // Create sample projects
  const projects = [
    {
      name: 'Wedding Photo Album - John & Jane',
      contentLink: 'https://drive.google.com/albums/wedding-2024',
      password: nanoid(12),
      price: 15000,
      status: 'delivered',
      clientId: clients[0].id,
    },
    {
      name: 'Corporate Event Coverage',
      contentLink: 'https://drive.google.com/albums/corporate-event',
      password: nanoid(12),
      price: 25000,
      status: 'paid',
      clientId: clients[1].id,
    },
    {
      name: 'Birthday Party Photography',
      contentLink: 'https://drive.google.com/albums/birthday-bash',
      password: nanoid(12),
      price: 8000,
      status: 'pending',
      clientId: clients[2].id,
    },
    {
      name: 'Pre-Wedding Photoshoot',
      contentLink: 'https://drive.google.com/albums/pre-wedding',
      password: nanoid(12),
      price: 12000,
      status: 'pending',
      clientId: clients[3].id,
    },
    {
      name: 'Product Photography Session',
      contentLink: 'https://drive.google.com/albums/product-photos',
      password: nanoid(12),
      price: 18000,
      status: 'paid',
      clientId: clients[4].id,
    },
    {
      name: 'Family Portrait Session',
      contentLink: 'https://drive.google.com/albums/family-portraits',
      password: nanoid(12),
      price: 10000,
      status: 'delivered',
      clientId: clients[0].id,
    },
    {
      name: 'Real Estate Photography',
      contentLink: 'https://drive.google.com/albums/real-estate',
      password: nanoid(12),
      price: 20000,
      status: 'pending',
      clientId: clients[1].id,
    },
    {
      name: 'Graduation Ceremony Photos',
      contentLink: 'https://drive.google.com/albums/graduation',
      password: nanoid(12),
      price: 7500,
      status: 'paid',
      clientId: clients[2].id,
    },
  ]

  for (const project of projects) {
    await prisma.project.create({
      data: project,
    })
  }
  console.log(`✅ Created ${projects.length} projects`)

  // Create sample payments
  const allProjects = await prisma.project.findMany()
  const paidProjects = allProjects.filter((p) => p.status === 'paid' || p.status === 'delivered')

  for (const project of paidProjects) {
    await prisma.payment.create({
      data: {
        projectId: project.id,
        amount: project.price,
        method: ['mpesa', 'paypal', 'bank'][Math.floor(Math.random() * 3)],
        status: 'confirmed',
        transactionRef: `TXN${nanoid(8)}`,
        confirmedAt: new Date(),
      },
    })
  }
  console.log(`✅ Created ${paidProjects.length} payments`)

  // Create sample delivery logs
  const deliveredProjects = allProjects.filter((p) => p.status === 'delivered')
  
  for (const project of deliveredProjects) {
    // Email delivery
    await prisma.deliveryLog.create({
      data: {
        projectId: project.id,
        method: 'email',
        status: 'sent',
        message: 'Password sent via email',
      },
    })
    
    // SMS delivery
    await prisma.deliveryLog.create({
      data: {
        projectId: project.id,
        method: 'sms',
        status: 'sent',
        message: 'Password sent via SMS',
      },
    })
    
    // WhatsApp delivery
    await prisma.deliveryLog.create({
      data: {
        projectId: project.id,
        method: 'whatsapp',
        status: 'sent',
        message: 'Password sent via WhatsApp',
      },
    })
  }
  console.log(`✅ Created delivery logs`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
