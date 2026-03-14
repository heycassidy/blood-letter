import { useDraggable } from '@dnd-kit/react'
import type { LetterCardProps, UUID } from '../lib/types'
import { css } from '../styled-system/css'
import LetterCard from './LetterCard'

interface Props {
  id: UUID
}

export const DraggableLetterCard = (props: Props & LetterCardProps) => {
  const { letter, id, ...rest } = props

  const { ref, isDragSource } = useDraggable({
    id,
    data: { letter, origin: letter.origin },
  })

  return (
    <LetterCard
      ref={ref}
      className={dragStyles}
      letter={letter}
      dragging={isDragSource}
      {...rest}
    />
  )
}

const dragStyles = css({
  touchAction: 'none',
  cursor: 'pointer',
})
