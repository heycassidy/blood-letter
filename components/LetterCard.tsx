import type { Letter } from '../lib/types'
import { computeLetterValueFromTier } from '../lib/helpers'
import css from 'styled-jsx/css'

type Props = {
  letter: Letter
  onClick?: () => void
}

const LetterCard: React.FC<Props> = (props) => {
  const { letter, onClick } = props
  const { name, tier } = letter

  const value = computeLetterValueFromTier(tier)

  return (
    <div className="letter" onClick={onClick}>
      <div className="tier">{tier}</div>
      <div className="name">{name.toUpperCase()}</div>
      <div className="value">{value}</div>
      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .letter {
    border: 1px solid black;
    background-color: white;
    position: relative;
    aspect-ratio: 1;
    max-width: fit-content;
    display: flex;
    width: 4rem;
    height: 4rem;
    cursor: pointer;
    user-select: none;
  }
  .name {
    font-weight: 700;
    font-size: 2rem;
    margin: auto;
  }
  .tier,
  .value {
    position: absolute;
    padding: 0.125rem;
    right: 0;
    line-height: 1;
    font-size: 0.8rem;
  }
  .tier {
    top: 0;
  }
  .value {
    bottom: 0;
  }
`

export default LetterCard
