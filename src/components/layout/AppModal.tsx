import { Platform } from 'react-native'
import { MobileSheet } from './MobileSheet'
import { WebDialog } from './WebDialog'

type AppModalProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function AppModal(props: AppModalProps) {
  if (Platform.OS === 'web') {
    return <WebDialog {...props} />
  }
  return <MobileSheet {...props} />
}
