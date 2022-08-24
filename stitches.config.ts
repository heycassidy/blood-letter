import { createStitches } from '@stitches/react'
import { defaultTheme } from './styles/themes'
// import { colors } from './styles/colors'

export const { css, globalCss, theme, config } = createStitches({
  theme: defaultTheme,
})
