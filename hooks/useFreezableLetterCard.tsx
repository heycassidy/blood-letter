import Letter from '../lib/Letter'

const useFreezableLetterCard = (letter: Letter, enabled?: boolean) => {
  if (!enabled) {
    return [{}, {}]
  }

  let styles = {}

  if (letter.frozen) {
    styles = {
      color: '$blue750',
      backgroundColor: '$blue50',
      borderColor: '$blue600',
      boxShadow: '0 0 2px 1px inset $colors$blue350',
    }
  }

  return [styles]
}

export default useFreezableLetterCard
