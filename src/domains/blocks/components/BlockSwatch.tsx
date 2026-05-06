import { View } from 'react-native'

type Props = {
  color: string
  size?: number
}

export function BlockSwatch({ color, size = 8 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}
