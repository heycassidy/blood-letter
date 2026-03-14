import {
  Children,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { css } from '../styled-system/css'

const InfoList: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={listStyles}>
      {Children.map(children, (child: ReactNode) => (
        <span className={itemStyles}>{child}</span>
      ))}
    </div>
  )
}

const listStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1',
})

const itemStyles = css({
  lineHeight: 'tight',
  paddingY: '0',
  paddingX: '2',
  background: 'gray.300',
})

export default InfoList
