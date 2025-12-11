export { default } from 'next-auth/middleware'

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
