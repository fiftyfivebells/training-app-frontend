import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert as RNAlert,
} from 'react-native';
import { colors, spacing, typography } from '@theme/index';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ title, message, buttons });
    } else {
      const nativeButtons = buttons?.map(button => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style,
      })) || [{ text: 'OK' }];

      RNAlert.alert(title, message, nativeButtons);
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    setAlertConfig(null);
    button.onPress?.();
  };

  const handleBackdropPress = () => {
    const cancelButton = alertConfig?.buttons?.find(b => b.style === 'cancel');
    if (cancelButton) {
      handleButtonPress(cancelButton);
    } else {
      setAlertConfig(null);
    }
  };

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
          <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
            <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
              <View style={styles.alertCard}>
                <Text style={styles.title}>{alertConfig.title}</Text>
                {alertConfig.message && (
                  <Text style={styles.message}>{alertConfig.message}</Text>
                )}

                <View style={styles.buttonContainer}>
                  {(alertConfig.buttons || [{ text: 'OK' }]).map((button, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.button,
                        button.style === 'cancel' && styles.buttonCancel,
                        button.style === 'destructive' && styles.buttonDestructive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          button.style === 'cancel' && styles.buttonTextCancel,
                          button.style === 'destructive' && styles.buttonTextDestructive,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
  },
  alertCard: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.brown.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: colors.stone.light,
  },
  buttonDestructive: {
    backgroundColor: '#DC2626',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.cream,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  buttonTextCancel: {
    color: colors.brown.DEFAULT,
  },
  buttonTextDestructive: {
    color: colors.cream,
  },
});
