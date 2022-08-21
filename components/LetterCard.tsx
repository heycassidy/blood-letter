import type { Letter } from '../lib/types'
import { css } from '../stitches.config'

type Props = {
  letter: Letter
  onClick?: () => void
}

const LetterCard = (props: Props) => {
  const { letter, onClick } = props
  const { name, tier, value } = letter

  return (
    <div className={styles()} onClick={onClick}>
      <div className="tier">{tier}</div>
      <div className="name">{name.toUpperCase()}</div>
      <div className="value">{value}</div>
    </div>
  )
}

const styles = css({
  border: '1px solid $neutral875',
  backgroundColor: 'white',
  position: 'relative',
  aspectRatio: '1',
  maxWidth: 'fit-content',
  display: 'flex',
  cursor: 'pointer',
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
})

export default LetterCard
