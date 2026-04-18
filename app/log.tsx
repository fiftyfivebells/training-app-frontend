import { View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

export default function LogScreen() {
  const { colors } = useTheme()
  return <View style={{ flex: 1, backgroundColor: colors.background.elevated }} />
}
