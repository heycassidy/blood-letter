import { GameContextProvider } from '../context/GameContext'

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
