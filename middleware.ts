import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow if user has a valid token
      return !!token
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'kingkidd-demo-secret-key',
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/clients/:path*',
    '/payments/:path*',
    '/logs/:path*',
    '/settings/:path*',
    '/client/dashboard/:path*',
    '/client/payment/:path*',
  ],
}
