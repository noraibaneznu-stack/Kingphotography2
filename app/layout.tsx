import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Kingkidd Photography - Admin Dashboard',
  description: 'Automated password delivery system for Kingkidd Photography',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
