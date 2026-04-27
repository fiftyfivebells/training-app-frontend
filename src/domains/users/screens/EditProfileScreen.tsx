import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useGetCurrentUser } from '@/domains/users/hooks/useGetCurrentUser'
import { useUpdateProfile } from '@/domains/users/hooks/useUpdateProfile'
import { useTheme } from '@/theme/useTheme'

interface EditProfileForm {
  firstName: string
  lastName: string
  email: string
  timezone: string
}

export function EditProfileScreen() {
  const { bg, text, rule, accent, semantic } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: user } = useGetCurrentUser()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const [affirmationTime, setAffirmationTime] = useState<Date>(() => {
    const d = new Date()
    d.setHours(8, 0, 0, 0)
    return d
  })
  const [showTimePicker, setShowTimePicker] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        timezone: user.timeZone,
      })
    }
  }, [user, reset])

  useEffect(() => {
    AsyncStorage.getItem('@basephase/affirmationTime').then((time) => {
      if (time) setAffirmationTime(new Date(time))
    }).catch(() => {})
  }, [])

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false)
    if (selectedDate) {
      setAffirmationTime(selectedDate)
      AsyncStorage.setItem('@basephase/affirmationTime', selectedDate.toISOString()).catch(() => {})
    }
  }

  const onSubmit = (data: EditProfileForm) => {
    updateProfile(
      { firstName: data.firstName, lastName: data.lastName, timeZone: data.timezone },
      { onSuccess: () => router.back() }
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: bg.base }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text.primary }]}>Edit profile</Text>
        <TouchableOpacity style={styles.headerRight} onPress={handleSubmit(onSubmit)} disabled={isPending}>
          <Text style={[styles.saveBtnText, { color: accent.default }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: text.tertiary }]}>First name</Text>
          <Controller
            control={control}
            name="firstName"
            rules={{ required: 'First name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: bg.input, borderColor: rule.subtle, color: text.primary }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="First name"
                placeholderTextColor={text.tertiary}
              />
            )}
          />
          {errors.firstName && <Text style={[styles.error, { color: semantic.error }]}>{errors.firstName.message}</Text>}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: text.tertiary }]}>Last name</Text>
          <Controller
            control={control}
            name="lastName"
            rules={{ required: 'Last name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: bg.input, borderColor: rule.subtle, color: text.primary }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Last name"
                placeholderTextColor={text.tertiary}
              />
            )}
          />
          {errors.lastName && <Text style={[styles.error, { color: semantic.error }]}>{errors.lastName.message}</Text>}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: text.tertiary }]}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: bg.input, borderColor: rule.subtle, color: text.tertiary }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor={text.tertiary}
                editable={false}
              />
            )}
          />
          {errors.email && <Text style={[styles.error, { color: semantic.error }]}>{errors.email.message}</Text>}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: text.tertiary }]}>Timezone</Text>
          <Controller
            control={control}
            name="timezone"
            rules={{ required: 'Timezone is required' }}
            render={({ field: { value, onChange } }) => (
              <View style={[styles.input, { backgroundColor: bg.input, borderColor: rule.subtle, justifyContent: 'center', paddingHorizontal: 0, overflow: 'hidden' }]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={{ color: text.primary, height: 50, width: '100%' }}
                  dropdownIconColor={text.tertiary}
                >
                  <Picker.Item label="America/New York" value="America/New_York" />
                  <Picker.Item label="America/Chicago" value="America/Chicago" />
                  <Picker.Item label="America/Denver" value="America/Denver" />
                  <Picker.Item label="America/Los Angeles" value="America/Los_Angeles" />
                  <Picker.Item label="Europe/London" value="Europe/London" />
                  <Picker.Item label="Europe/Paris" value="Europe/Paris" />
                  <Picker.Item label="Asia/Tokyo" value="Asia/Tokyo" />
                  <Picker.Item label="Australia/Sydney" value="Australia/Sydney" />
                </Picker>
              </View>
            )}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: text.tertiary }]}>Affirmation time</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: bg.input, borderColor: rule.subtle, justifyContent: 'center' }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ fontFamily: 'Manrope', color: text.primary }}>
              {affirmationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={affirmationTime}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginLeft: -10 },
  headerRight: { width: 40, alignItems: 'flex-end', justifyContent: 'center' },
  saveBtnText: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '500' },
  fieldContainer: { marginBottom: 20 },
  label: { fontFamily: 'Manrope', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  input: { fontFamily: 'Manrope', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, height: 50, fontSize: 15 },
  error: { fontFamily: 'Manrope', fontSize: 12, marginTop: 6 },
})
