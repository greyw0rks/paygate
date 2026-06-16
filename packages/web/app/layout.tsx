import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PayGate — Hedera Policy Agent',
  description: 'Policy-constrained treasury agent on Hedera. Built for the Hedera AI Agent Bounty Week 5.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
