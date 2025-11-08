import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors, spacing, typography } from '@theme/index';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  disabled?: boolean;
}

export function Input({ 
  label, 
  error, 
  disabled, 
  style, 
  ...props 
}: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor={colors.stone.light}
        editable={!disabled}
        autoCorrect={false}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.charcoal,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.sand,
    opacity: 0.6,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});