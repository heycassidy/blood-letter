import { type ComponentPropsWithRef, forwardRef } from 'react'
import getFreezableLetterCardProps from '@/hooks/getFreezableLetterCardProps'
import useSelectableLetterCard from '@/hooks/useSelectableLetterCard'
import type { LetterCardProps } from '@/lib/types'
import { css, cx } from '@/styled-system/css'

type Ref = HTMLDivElement

const LetterCard = forwardRef<
  Ref,
  LetterCardProps & ComponentPropsWithRef<'div'>
>((props, ref) => {
  const { letter, dragging, selectable, freezable, className, ...rest } = props

  const [, selectableProps] = useSelectableLetterCard(letter, selectable)

  const [, freezableProps] = getFreezableLetterCardProps(letter, freezable)

  const { name, value } = letter

  return (
    <div
      ref={ref}
      className={cx(styles, className)}
      {...selectableProps}
      {...freezableProps}
      {...rest}
    >
      <div
        className={css({
          position: 'absolute',
          padding: '0.5',
          top: '0',
          right: '0',
          lineHeight: 'tight',
          fontSize: 'xs',
        })}
      >
        {value}
      </div>
      <div
        className={css({
          fontWeight: 'bold',
          fontSize: '2xl',
          margin: 'auto',
        })}
      >
        {name.toUpperCase()}
      </div>
    </div>
  )
})
LetterCard.displayName = 'LetterCard'

const styles = css({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'gray.11',
  backgroundColor: 'white',
  position: 'relative',
  display: 'flex',
  userSelect: 'none',
  width: '12',
  height: '12',
  zIndex: '[1]',
  _pressed: { opacity: '0.5' },
  _selected: { borderWidth: '3px' },
  _frozen: {
    color: 'blue.11',
    backgroundColor: 'blue.2',
    borderColor: 'blue.9',
    boxShadow: 'inset',
    boxShadowColor: 'blue.6',
  },
})

export default LetterCard
