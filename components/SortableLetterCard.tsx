import { closestCenter } from '@dnd-kit/collision'
import { useSortable } from '@dnd-kit/react/sortable'
import type { LetterCardProps, UUID } from '@/lib/types'
import { css } from '@/styled-system/css'
import LetterCard from './LetterCard'

interface Props {
  id: UUID
  index: number
}

export const SortableLetterCard = (props: Props & LetterCardProps) => {
  const { letter, id, index, ...rest } = props

  const { ref, isDragSource } = useSortable({
    id,
    index,
    data: { letter, origin: letter.origin },
    collisionDetector: closestCenter,
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
