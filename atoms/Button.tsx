import { css } from '../styled-system/css'
import { FC, ComponentPropsWithoutRef } from 'react'

type ButtonProps = ComponentPropsWithoutRef<'button'>

const Button: FC<ButtonProps> = ({ children, ...rest }): JSX.Element => {
  return (
    <button className={styles} {...rest}>
      {children}
    </button>
  )
}

const styles = css({
  borderRadius: 'md',
  fontSize: 'md',
  paddingInline: '3',
  paddingBlock: '1',
  lineHeight: 'tight',
  cursor: 'pointer',
  color: 'neutral.950',
  backgroundColor: 'neutral.200',
  '&:hover:not(:focus)': {
    backgroundColor: 'neutral.700',
    color: 'white',
  },
})

export default Button
