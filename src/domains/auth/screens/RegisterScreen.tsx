import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useRegister } from '../hooks';
import type { CreateUserRequest } from '../api/authApi';
import { Input, Button, Select, useAlert } from '@components/ui'
import { colors, spacing, typography } from '@theme/index'
import * as Localization from 'expo-localization';

interface RegisterFormData extends CreateUserRequest {
  confirmPassword: string;
}

export function RegisterScreen() {
  const router = useRouter();
  const { alert } = useAlert();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      preferredUnits: 'imperial',
      dateOfBirth: '2000-01-01'
    }
  });

  const registerMutation = useRegister({
    onSuccess: (data, variables) => {
      alert(
        'Account Created!',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/(auth)/verify-email',
                params: { email: variables.email }
              });
            }
          }
        ]
      );
    },
    onError: (error) => {
      alert(
        'Registration Failed',
        error.message || 'Something went wrong. Please try again.'
      );
    }
  });

  const password = watch('password');
  const dateOfBirth = watch('dateOfBirth')

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...createUserData } = data;

    const timeZone = Localization.getCalendars()[0]?.timeZone || 'America/New_York';

    const completeUserData: CreateUserRequest = {
      ...createUserData,
      timeZone: timeZone
    }

    registerMutation.mutate(completeUserData);
  };

  const isLoading = registerMutation.isPending;

  // TODO: dates need to be broken out into their own component, and these
  // helpers can go with it
  const stringToDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(2000, 0, 1) : date;
  };

  const dateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = stringToDate(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your mindful running journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <Controller
              control={control}
              name="firstName"
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Jane"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                />
              )}
            />


            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Date of Birth */}
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{
                required: 'Date of birth is required',
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2}$/,
                  message: 'Invalid date format'
                },
                validate: {
                  notFuture: (value) => {
                    const input = stringToDate(value);
                    return input <= new Date() || 'Date of birth cannot be in the future';
                  },
                  minimumAge: (value) => {
                    const age = calculateAge(stringToDate(value));
                    return age >= 13 || 'You must be at least 13 years old';
                  },
                  maximumAge: (value) => {
                    const age = calculateAge(stringToDate(value));
                    return age <= 120 || 'Please enter a valid date of birth';
                  }
                }
              }}
              render={({ field: { value } }) => (
                <View>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Pressable
                    onPress={() => !isLoading && setShowDatePicker(true)}
                    disabled={isLoading}
                    style={[
                      styles.dateInput,
          isLoading && styles.dateInputDisabled,
          errors.dateOfBirth && styles.dateInputError
                    ]}
                  >
                    <Text style={[
                                styles.dateText,
          isLoading && styles.dateTextDisabled
                    ]}>
                      {formatDateForDisplay(value)}
                    </Text>
                  </Pressable>
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
                  )}
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={stringToDate(value)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setValue('dateOfBirth', dateToString(selectedDate), { shouldValidate: true });
                        }
                      }}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                    />
                  )}
                  {Platform.OS === 'ios' && showDatePicker && (
                    <Button
                      title="Done"
                      onPress={() => setShowDatePicker(false)}
                    />
                  )}
                </View>
              )}
            />

            {/* Preferred Units */}
            <Controller
              control={control}
              name="preferredUnits"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Preferred Units"
                  value={value as string}
                  onValueChange={onChange}
                  options={[
                    { label: 'Metric (km)', value: 'metric' },
                    { label: 'Imperial (miles)', value: 'imperial' },
                  ]}
                  disabled={isLoading}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              title={isLoading ? "Creating Account..." : "Create Account"}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text 
                style={styles.footerLink}
                onPress={() => router.push('/(auth)/login')}
              >
                Log in
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    textAlign: 'center',
  },
  form: {
    gap: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
  },
  footerLink: {
    fontSize: typography.sizes.base,
    color: colors.primary.DEFAULT,
    fontWeight: typography.weights.semibold,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateInputDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  dateInputError: {
    borderColor: '#DC2626',
  },
  dateText: {
    fontSize: typography.sizes.base,
    color: colors.charcoal,
  },
  dateTextDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});



