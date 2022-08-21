import chroma from 'chroma-js'

interface Palette {
  [colorFamilyName: string]: ColorFamily
}
interface ColorFamily {
  [colorName: string]: string
}

// https://app.atmos.style/
const palette: Palette = {
  // Neutral
  neutral: {
    0: '#fefcfb',
    100: '#f8f6f5',
    175: '#edeae9',
    275: '#dbd9d7',
    350: '#b7b3b1',
    425: '#908b89',
    525: '#7a7371',
    600: '#645a5c',
    700: '#4f464a',
    775: '#3b3239',
    875: '#262129',
    950: '#130f19',
  },
}

export const colors = flattenPalette<chroma.Color>(palette, true)
export const hexColors = flattenPalette<string>(palette, false)

function flattenPalette<T extends string | chroma.Color>(
  palette: Palette,
  useChroma: boolean
): { [colorName: string]: T extends string ? string : chroma.Color } {
  return Object.entries(palette).reduce(
    (acc, [colorFamilyName, colorFamily]) => {
      return {
        ...acc,
        ...Object.entries(colorFamily).reduce(
          (acc, [colorName, colorValue]) => {
            return {
              ...acc,
              [`${colorFamilyName}${colorName}`]: useChroma
                ? chroma(colorValue)
                : colorValue,
            }
          },
          {}
        ),
      }
    },
    {}
  )
}
