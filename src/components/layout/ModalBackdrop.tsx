import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Pressable } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'

export function ModalBackdrop({ onPress }: { onPress: () => void }) {
  const theme = useTheme()

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.modal.backdrop,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onPress} />
    </Animated.View>
  )
}
