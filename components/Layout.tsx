import { ReactNode } from 'react'

type LayoutProps = {
  children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      {children}

      <style jsx>{`
        .layout {
          gap: 1rem;
          display: grid;
          justify-content: start;
          justify-items: start;
        }
      `}</style>
    </div>
  )
}

export default Layout
