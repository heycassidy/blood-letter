import { css } from '../styled-system/css'
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
    <div className={listStyles}>
      {Children.map(children, (child: ReactNode) => {
        if (isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, {
            className: itemStyles,
          })
        }
      })}
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
