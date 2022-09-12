import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LetterCardProps, UUID } from '../lib/types'
import LetterCard from './LetterCard'

interface Props {
  id: UUID
}

export const SortableLetterCard = (props: Props & LetterCardProps) => {
  const { letter, id, ...rest } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { letter, origin: letter.origin },
  })

  const styles = {
    touchAction: 'none',
    cursor: 'pointer',
    transform: CSS.Transform.toString(transform),
    transition,
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
