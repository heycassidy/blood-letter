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
          padding: 1rem;
          gap: 1rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: start;
        }
      `}</style>
    </div>
  )
}

export default Layout
