import './index.css'
import type { Metadata } from 'next'
import { GameContextProvider } from '@/context/GameContext'

export const metadata: Metadata = {
  title: 'Blood Letter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <GameContextProvider>{children}</GameContextProvider>
        </main>
      </body>
    </html>
  )
}
