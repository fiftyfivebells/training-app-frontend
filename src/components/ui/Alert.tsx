import React, { createContext, ReactNode, useContext, useState } from 'react'
import {
  Alert as RNAlert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { useTheme } from '@/theme/useTheme'

import { ThemedText } from './ThemedText'

export interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface AlertConfig {
  title: string
  message?: string
  buttons?: AlertButton[]
}

interface AlertContextType {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void
}

const AlertContext = createContext<AlertContextType | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null)
  const { colors, space, radius } = useTheme()

  const alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ title, message, buttons })
    } else {
      const nativeButtons = buttons?.map((button) => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style,
      })) || [{ text: 'OK' }]

      RNAlert.alert(title, message, nativeButtons)
    }
  }

  const handleButtonPress = (button: AlertButton) => {
    setAlertConfig(null)
    button.onPress?.()
  }

  const handleBackdropPress = () => {
    const cancelButton = alertConfig?.buttons?.find((b) => b.style === 'cancel')
    if (cancelButton) {
      handleButtonPress(cancelButton)
    } else {
      setAlertConfig(null)
    }
  }

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}

      {Platform.OS === 'web' && alertConfig && (
        <Modal
          visible={!!alertConfig}
          transparent
          animationType="fade"
          onRequestClose={handleBackdropPress}
        >
          <Pressable
            style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={handleBackdropPress}
          >
            <Pressable
              style={styles.alertContainer}
              onPress={(e) => {
                e.stopPropagation()
              }}
            >
              <View
                style={[
                  {
                    backgroundColor: colors.background.surface,
                    borderRadius: radius.lg,
                    padding: space[6],
                  },
                  styles.cardShadow,
                ]}
              >
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: space[2],
                    textAlign: 'center',
                  }}
                >
                  {alertConfig.title}
                </ThemedText>
                {alertConfig.message && (
                  <ThemedText
                    style={{
                      fontSize: 15,
                      color: colors.text.secondary,
                      marginBottom: space[6],
                      textAlign: 'center',
                      lineHeight: 15 * 1.4,
                    }}
                  >
                    {alertConfig.message}
                  </ThemedText>
                )}

                <View style={styles.buttonContainer}>
                  {(alertConfig.buttons || [{ text: 'OK' }]).map((button, index, arr) => {
                    const variantStyles = getButtonVariantStyles({ colors, radius }, button.style)
                    return (
                      <Pressable
                        key={index}
                        style={({ pressed }) => [
                          styles.button,
                          {
                            borderRadius: radius.full,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            paddingVertical: space[2],
                            paddingHorizontal: space[4],
                          },
                          variantStyles.container,
                          index < arr.length - 1 && { marginBottom: space[2] },
                          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                        ]}
                        onPress={() => {
                          handleButtonPress(button)
                        }}
                      >
                        <ThemedText
                          style={[
                            {
                              fontSize: 15,
                              fontWeight: '600',
                              textAlign: 'center',
                            },
                            variantStyles.text,
                          ]}
                        >
                          {button.text}
                        </ThemedText>
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
})

function getButtonVariantStyles(
  theme: { colors: any; radius: any },
  variant?: AlertButton['style']
) {
  const { colors, radius } = theme
  switch (variant) {
    case 'cancel':
      return {
        container: {
          backgroundColor: colors.background.elevated,
        },
        text: {
          color: colors.text.primary,
        },
      }
    case 'destructive':
      return {
        container: {
          backgroundColor: colors.semantic.errorFg,
        },
        text: {
          color: colors.background.base,
        },
      }
    default:
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.copper.default,
        },
        text: {
          color: colors.copper.default,
        },
      }
  }
}

