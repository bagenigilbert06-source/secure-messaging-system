import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/auth-context'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zetech Lost & Found - Messaging System | Find Your Lost Items',
  description: 'Modern messaging system for Zetech University Lost & Found platform. Connect with admin, track inquiries, and recover lost items through our WhatsApp-like interface.',
  generator: 'v0.app',
  openGraph: {
    title: 'Zetech Lost & Found - Real-time Messaging',
    description: 'Instant messaging with admin support for lost item recovery. Modern interface with real-time notifications and delivery status.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
