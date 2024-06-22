import { useDraggable } from '@dnd-kit/core'
import { BlotCardProps, UUID } from '../lib/types'
import BlotCard from './BlotCard'

interface Props {
  id: UUID
}

export const DraggableBlotCard = (props: Props & BlotCardProps) => {
  const { blot, id, ...rest } = props

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { item: blot },
  })

  const styles = {
    touchAction: 'none',
    cursor: 'pointer',
  }

  return (
    <BlotCard
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={styles}
      blot={blot}
      dragging={isDragging}
      {...rest}
    />
  )
}
