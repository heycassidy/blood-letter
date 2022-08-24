import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const useSortableLetterCard = (id: string) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const styles = {
    touchAction: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const props = {
    ref: setNodeRef,
    ...attributes,
    ...listeners,
  }

  return [props, styles]
}

export default useSortableLetterCard
