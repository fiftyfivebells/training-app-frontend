import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'

export function ModalBackdrop({ onPress }: { onPress: () => void }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.backdrop}
    >
      <Pressable style={styles.pressable} onPress={onPress} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pressable: {
    flex: 1,
  },
})
