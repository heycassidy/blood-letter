import { ReactNode } from 'react'
import css from 'styled-jsx/css'

type Props = {
  children: ReactNode[]
  capacity: number
}

const LetterList = ({ children = [], capacity = 1 }: Props) => {
  return (
    <>
      <div className="letter-list">
        {children}

        {capacity > children.length &&
          [...Array(capacity - children.length)].map((_, i) => (
            <span className="empty-slot" key={`empty-slot-${i}`}></span>
          ))}
      </div>

      <style jsx>{`
        .letter-list {
          grid-template-columns: repeat(${capacity}, 3rem);
          grid-template-rows: 3rem;
        }
      `}</style>
      <style jsx>{styles}</style>
    </>
  )
}

const styles = css`
  .letter-list {
    display: grid;
    justify-content: start;
    grid-auto-flow: column;
    gap: 0.5rem;
    box-sizing: content-box;
  }
  .empty-slot {
    border: 1px solid white;
    aspect-ratio: 1;
  }
`

export default LetterList
