import { globalCss } from '../stitches.config'
import { cssReset } from './cssReset'
import { typography } from './typography'

export const globalStyles = globalCss<Record<string, unknown>>(
  ...[
    cssReset,
    typography,
    {
      button: {
        borderRadius: '0.25rem',
        fontSize: '0.8rem',
        padding: '0.25rem 0.5rem',
        border: '1px solid $neutral425',
        cursor: 'pointer',
        color: 'black',
        backgroundColor: '$neutral175',
        '&:hover:not(:focus)': {
          backgroundColor: '$neutral700',
          color: 'white',
        },
      },
    },
  ]
)
