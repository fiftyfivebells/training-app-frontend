import React, { createContext, ReactNode, useContext, useState } from 'react'
import {
  Alert as RNAlert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import type { Theme } from '@/theme/types'

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
  const theme = useTheme()

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
            style={[styles.backdrop, { backgroundColor: theme.modal.backdrop }]}
            onPress={handleBackdropPress}
          >
            <Pressable
              style={styles.alertContainer}
              onPress={(e) => {
                e.stopPropagation()
              }}
            >
              <View style={[theme.modal.card, theme.modal.cardShadow]}>
                <ThemedText
                  style={{
                    fontSize: theme.typography.size.xl,
                    fontWeight: theme.typography.weights.bold,
                    color: theme.semantic.text.primary,
                    marginBottom: theme.spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  {alertConfig.title}
                </ThemedText>
                {alertConfig.message && (
                  <ThemedText
                    style={{
                      fontSize: theme.typography.size.md,
                      color: theme.semantic.text.secondary,
                      marginBottom: theme.spacing.lg,
                      textAlign: 'center',
                      lineHeight: theme.typography.size.md * 1.4,
                    }}
                  >
                    {alertConfig.message}
                  </ThemedText>
                )}

                <View style={styles.buttonContainer}>
                  {(alertConfig.buttons || [{ text: 'OK' }]).map((button, index, arr) => {
                    const variantStyles = getButtonVariantStyles(theme, button.style)
                    return (
                      <Pressable
                        key={index}
                        style={({ pressed }) => [
                          styles.button,
                          theme.buttons.base,
                          variantStyles.container,
                          {
                            paddingVertical: theme.spacing.sm,
                            paddingHorizontal: theme.spacing.md,
                          },
                          index < arr.length - 1 && { marginBottom: theme.spacing.sm },
                          pressed && theme.buttons.states.pressed,
                        ]}
                        onPress={() => {
                          handleButtonPress(button)
                        }}
                      >
                        <ThemedText
                          style={[
                            {
                              fontSize: theme.typography.size.md,
                              fontWeight: theme.typography.weights.semibold,
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
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
})

function getButtonVariantStyles(theme: Theme, variant?: AlertButton['style']) {
  switch (variant) {
    case 'cancel':
      return {
        container: {
          backgroundColor: theme.semantic.surface.cardAlt,
        },
        text: {
          color: theme.semantic.text.primary,
        },
      }
    case 'destructive':
      return {
        container: {
          backgroundColor: theme.semantic.mood.highTough.border,
        },
        text: {
          color: theme.semantic.text.inverse,
        },
      }
    default:
      return {
        container: theme.buttons.variants.secondary.container,
        text: theme.buttons.variants.secondary.text,
      }
  }
}
