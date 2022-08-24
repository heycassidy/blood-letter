import { css } from '../stitches.config'
import {
  FC,
  Children,
  cloneElement,
  PropsWithChildren,
  ReactNode,
  isValidElement,
} from 'react'

const InfoList: FC<PropsWithChildren> = ({ children }): JSX.Element => {
  return (
    <div className={listStyles()}>
      {Children.map(children, (child: ReactNode) => {
        if (isValidElement(child)) {
          return cloneElement(child, { className: itemStyles() })
        }
      })}
    </div>
  )
}

const listStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem',
})

const itemStyles = css({
  lineHeight: '1',
  padding: '0.125rem 0.5rem',
  background: '$neutral275',
})

export default InfoList
