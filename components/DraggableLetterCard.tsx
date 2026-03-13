import { useDraggable } from '@dnd-kit/react'
import type { LetterCardProps, UUID } from '../lib/types'
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
      style={{ touchAction: 'none', cursor: 'pointer' }}
      letter={letter}
      dragging={isDragSource}
      {...rest}
    />
  )
}
