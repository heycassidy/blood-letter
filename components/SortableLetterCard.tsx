import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Letter } from '../lib/types'
import LetterCard from './LetterCard'
import { css } from '../stitches.config'

type Props = {
  id: string
  letter: Letter
  onClick?: () => void
}

const SortableLetterCard = ({ id, letter, onClick }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={styles()}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <LetterCard letter={letter} onClick={onClick} />
    </div>
  )
}

const styles = css({
  touchAction: 'none',
})

export default SortableLetterCard
