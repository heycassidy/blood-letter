import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Letter } from '../lib/types'
import LetterCard from './LetterCard'
import css from 'styled-jsx/css'

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
      className="sortable-letter-card"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <LetterCard letter={letter} onClick={onClick} />
      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .sortable-letter-card {
    touch-action: none;
    /* transform: translate(var(--translate-x), var(--translate-y));
    transition: var(--transition, transform 0ms linear); */
  }
`

export default SortableLetterCard
