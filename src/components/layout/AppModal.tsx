import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/theme/ThemeProvider'

const SCREEN_HEIGHT = Dimensions.get('window').height
const ANIM_DURATION = 260

type AppModalProps = {
  children: React.ReactNode
  onClose?: () => void
}

export function AppModal({ children, onClose }: AppModalProps) {
  const router = useRouter()
  const theme = useTheme()

  const translateY = useSharedValue(SCREEN_HEIGHT)
  const opacity = useSharedValue(0)

  const close = React.useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 })

    translateY.value = withTiming(
      SCREEN_HEIGHT,
      {
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.ease),
      },
      () => {
        runOnJS(onClose ?? router.back)()
      },
    )
  }, [])

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 })
    translateY.value = withTiming(0, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.ease),
    })
  }, [])

  const startY = useSharedValue(0)

  const onStart = (e: any) => {
    startY.value = e.nativeEvent.pageY
  }

  const onMove = (e: any) => {
    const diff = e.nativeEvent.pageY - startY.value
    if (diff > 0) translateY.value = diff
  }

  const onRelease = (e: any) => {
    const diff = e.nativeEvent.pageY - startY.value
    if (diff > 100) {
      close()
    } else {
      translateY.value = withTiming(0, {
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.ease),
      })
    }
  }

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <View style={styles.fullscreen}>
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: theme.modal.backdrop },
          backdropStyle,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheetHeight,
          theme.modal.sheet,
          theme.modal.shadow,
          modalStyle,
        ]}
        onStartShouldSetResponder={() => true}
        onResponderStart={onStart}
        onResponderMove={onMove}
        onResponderRelease={onRelease}
      >
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  sheetHeight: { height: SCREEN_HEIGHT },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
})
