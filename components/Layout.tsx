import { ReactNode } from 'react'
import { css } from '../styled-system/css'

type LayoutProps = {
  children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return <div className={styles}>{children}</div>
}

const styles = css({
  gap: '4',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
})

export default Layout
