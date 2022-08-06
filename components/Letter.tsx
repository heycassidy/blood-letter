type Glyph =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

type Tier = 1 | 2 | 3 | 4 | 5 | 6

export const Letter = (props: {
  name: Glyph
  tier: Tier
}): { name: string; tier: number; value: number } => {
  return {
    name: props.name,
    tier: props.tier,
    value: props.tier ** 2,
  }
}

const Card = (props: { name: Glyph; tier: Tier }) => {
  const { name, value, tier } = Letter({ name: props.name, tier: props.tier })

  return (
    <div>
      <strong>{name}</strong> <span>tier: {tier}</span> |{' '}
      <span>value: {value}</span>
    </div>
  )
}

// Tier 1
export const E = () => <Card name="E" tier={1} />
export const T = () => <Card name="T" tier={1} />
export const A = () => <Card name="A" tier={1} />
export const I = () => <Card name="I" tier={1} />
export const O = () => <Card name="O" tier={1} />
export const N = () => <Card name="N" tier={1} />

// Tier 2
export const S = () => <Card name="S" tier={2} />
export const H = () => <Card name="H" tier={2} />
export const R = () => <Card name="R" tier={2} />
export const D = () => <Card name="D" tier={2} />

// Tier 3
export const L = () => <Card name="L" tier={3} />
export const C = () => <Card name="C" tier={3} />
export const U = () => <Card name="U" tier={3} />
export const M = () => <Card name="M" tier={3} />

// Tier 4
export const W = () => <Card name="W" tier={4} />
export const F = () => <Card name="F" tier={4} />
export const G = () => <Card name="G" tier={4} />
export const Y = () => <Card name="Y" tier={4} />

// Tier 5
export const P = () => <Card name="P" tier={5} />
export const B = () => <Card name="B" tier={5} />
export const V = () => <Card name="V" tier={5} />
export const K = () => <Card name="K" tier={5} />

// Tier 6
export const J = () => <Card name="J" tier={6} />
export const X = () => <Card name="X" tier={6} />
export const Q = () => <Card name="Q" tier={6} />
export const Z = () => <Card name="Z" tier={6} />

export default Card
