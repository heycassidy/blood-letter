import { useDraggable } from '@dnd-kit/core'
import { LetterCardProps, UUID } from '../lib/types'
import LetterCard from './LetterCard'

interface Props {
  id: UUID
}

export const DraggableLetterCard = (props: Props & LetterCardProps) => {
  const { letter, id, ...rest } = props

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { letter, origin: letter.origin },
  })

  const styles = {
    touchAction: 'none',
    cursor: 'pointer',
  }

  return (
    <LetterCard
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={styles}
      letter={letter}
      dragging={isDragging}
      {...rest}
    />
  )
}
