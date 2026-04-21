import { Dimensions, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { ModalBackdrop } from './ModalBackdrop'
import { useTheme } from '@/theme/useTheme'
import { useEffect } from 'react'

const SCREEN_HEIGHT = Dimensions.get('window').height

type MobileSheetProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSheet({ visible, onClose, children }: MobileSheetProps) {
  const { colors, space, radius } = useTheme()
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
            backgroundColor: colors.background.surface,
            padding: space[8],
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
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
