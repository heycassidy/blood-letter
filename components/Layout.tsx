import { ReactNode } from 'react'
import { css } from '../stitches.config'

type LayoutProps = {
  children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return <div className={styles()}>{children}</div>
}

const styles = css({
  gap: '1rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
})

export default Layout
