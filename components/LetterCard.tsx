import { Letter } from '../lib/types'
import { css } from '../stitches.config'
import useSortableLetterCard from '../hooks/useSortableLetterCard'
import useSelectableLetterCard from '../hooks/useSelectableLetterCard'

interface Props {
  letter: Letter
  selectable?: boolean
  sortable?: boolean
  onClick?: () => void
}

const LetterCard = (props: Props) => {
  const { letter, selectable, sortable } = props
  const { name, tier, value } = letter

  const [sortableProps, sortableStyles] = sortable
    ? useSortableLetterCard(letter.id)
    : []
  const [selectableProps, selectableStyles] = selectable
    ? useSelectableLetterCard(letter)
    : []

  const styles = css(baseStyles, sortableStyles, selectableStyles)

  return (
    <div {...sortableProps} {...selectableProps} className={styles()}>
      <div className="tier">{tier}</div>
      <div className="name">{name.toUpperCase()}</div>
      <div className="value">{value}</div>
    </div>
  )
}

const baseStyles = {
  border: '1px solid $neutral875',
  backgroundColor: 'white',
  position: 'relative',
  aspectRatio: '1',
  maxWidth: 'fit-content',
  display: 'flex',
  userSelect: 'none',
  width: '100%',
  height: '100%',

  '.name': {
    fontWeight: '700',
    fontSize: '1.5rem',
    margin: 'auto',
  },
  '.tier, .value': {
    position: 'absolute',
    padding: '0.125rem',
    right: '0',
    lineHeight: '1',
    fontSize: '0.8rem',
  },
  '.tier': {
    top: 0,
  },
  '.value': {
    bottom: 0,
  },
}

export default LetterCard
