import { Dimensions, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { ModalBackdrop } from './ModalBackdrop'
import { useTheme } from '@/theme/ThemeProvider'
import { useEffect } from 'react'

const SCREEN_HEIGHT = Dimensions.get('window').height

type MobileSheetProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSheet({ visible, onClose, children }: MobileSheetProps) {
  const theme = useTheme()
  const translateY = useSharedValue(SCREEN_HEIGHT)

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 200 })
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 })
    }
  }, [visible])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!visible) return null

  return (
    <>
      <ModalBackdrop onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          animStyle,
          {
            backgroundColor: theme.modal.sheet.backgroundColor,
            padding: theme.spacing.xl,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            ...theme.modal.shadow,
          },
        ]}
      >
        {children}
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    height: '90%',
    width: '100%',
  },
})
