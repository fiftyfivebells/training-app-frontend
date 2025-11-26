// components/ui/AppModal/WebDialog.tsx
import { StyleSheet, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { ModalBackdrop } from './ModalBackdrop'
import { useTheme } from '@/theme/ThemeProvider'
import { useEffect } from 'react'

type WebDialogProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function WebDialog({ visible, onClose, children }: WebDialogProps) {
  const theme = useTheme()
  const scale = useSharedValue(0.95)

  useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, { duration: 200 })
    } else {
      scale.value = withTiming(0.95, { duration: 200 })
    }
  }, [visible])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (!visible) return null

  return (
    <>
      <ModalBackdrop onPress={onClose} />
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.center]}
      >
        <Animated.View
          style={[
            styles.card,
            animStyle,
            {
              backgroundColor: theme.modal.card.backgroundColor,
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              ...theme.modal.cardShadow,
            },
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    maxWidth: 480,
    width: '90%',
  },
})
