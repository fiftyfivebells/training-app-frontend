import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActionSheetIOS, Platform } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'

import { useGetCurrentUser } from '@/domains/users/hooks/useGetCurrentUser'
import { useGetUserPreferences } from '@/domains/users/hooks/useGetUserPreferences'
import { useUpdatePreferences } from '@/domains/users/hooks/useUpdatePreferences'
import { useLifetimeStats } from '@/domains/users/hooks/useLifetimeStats'
import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'
import { useLogout } from '@/domains/auth/hooks/useLogout'
import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { CustomToggle } from '../components/CustomToggle'
import { AppearanceControl } from '../components/AppearanceControl'

export function ProfileScreen() {
  const { bg, text, rule, accent, semantic } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: user } = useGetCurrentUser()
  const { data: prefs } = useGetUserPreferences()
  const { mutate: updatePrefs } = useUpdatePreferences()
  const { data: lifetimeStats } = useLifetimeStats()
  const { unit, setUnit } = useDistanceUnitPreference()
  const { mutate: logout } = useLogout()

  const [affirmationTime, setAffirmationTime] = useState<Date>(() => {
    const d = new Date()
    d.setHours(8, 0, 0, 0)
    return d
  })
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [defaultRunType, setDefaultRunType] = useState('Easy')

  useEffect(() => {
    AsyncStorage.getItem('@basephase/affirmationTime').then((time) => {
      if (time) setAffirmationTime(new Date(time))
    }).catch(() => {})
    AsyncStorage.getItem('defaultRunType').then((t) => {
      if (t) setDefaultRunType(t.charAt(0).toUpperCase() + t.slice(1))
    }).catch(() => {})
  }, [])

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false)
    if (selectedDate) {
      setAffirmationTime(selectedDate)
      AsyncStorage.setItem('@basephase/affirmationTime', selectedDate.toISOString()).catch(() => {})

      if (prefs?.dailyPushEnabled) {
        // Notification scheduling is mocked in Expo Go — no-op until dev build
      }
    }
  }

  const handleToggleAffirmation = async (val: boolean) => {
    if (val) {
      Alert.alert(
        'Notifications mocked',
        'Push notifications are not fully supported in Expo Go SDK 53+. We have mocked the permission for now.'
      )
    }
    updatePrefs({ dailyPushEnabled: val })
  }

  const handleSignOut = () => {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'All your runs, blocks, and data will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { /* delete logic */ } },
      ]
    )
  }

  const handleDistanceUnitPress = () => {
    const options = ['Cancel', 'Kilometres', 'Miles']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex === 1) setUnit('metric')
          if (buttonIndex === 2) setUnit('imperial')
        }
      )
    } else {
      Alert.alert('Distance unit', '', [
        { text: 'Kilometres', onPress: () => setUnit('metric') },
        { text: 'Miles', onPress: () => setUnit('imperial') },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }

  const handleRunTypePress = () => {
    const options = ['Cancel', 'Recovery', 'Easy', 'Long', 'Tempo', 'Speed']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const val = options[buttonIndex]
            AsyncStorage.setItem('defaultRunType', val.toLowerCase())
            setDefaultRunType(val)
          }
        }
      )
    } else {
      Alert.alert('Default run type', '', [
        { text: 'Recovery', onPress: () => { AsyncStorage.setItem('defaultRunType', 'recovery'); setDefaultRunType('Recovery') } },
        { text: 'Easy', onPress: () => { AsyncStorage.setItem('defaultRunType', 'easy'); setDefaultRunType('Easy') } },
        { text: 'Long', onPress: () => { AsyncStorage.setItem('defaultRunType', 'long'); setDefaultRunType('Long') } },
        { text: 'Tempo', onPress: () => { AsyncStorage.setItem('defaultRunType', 'tempo'); setDefaultRunType('Tempo') } },
        { text: 'Speed', onPress: () => { AsyncStorage.setItem('defaultRunType', 'speed'); setDefaultRunType('Speed') } },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }

  const formatTimezone = (tz: string | undefined) => {
    if (!tz) return ''
    return tz.replace(/_/g, ' ').replace(/\//g, ' / ')
  }

  const formatAffirmationTime = (d: Date) => {
    let h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, '0')
    const ampm = h >= 12 ? 'pm' : 'am'
    h = h % 12
    h = h ? h : 12
    return `${h}:${m} ${ampm} each morning`
  }

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ''

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: bg.base }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text.primary }]}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Identity Card */}
        <View style={[styles.card, { backgroundColor: bg.surface, borderColor: rule.subtle, marginHorizontal: 16, marginTop: 4, paddingVertical: 20, paddingHorizontal: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.avatar, { backgroundColor: bg.surface, borderColor: accent.default }]}>
                <Text style={[styles.avatarText, { color: accent.default }]}>{initials}</Text>
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={[styles.fullName, { color: text.primary }]}>{user?.firstName} {user?.lastName}</Text>
                <Text style={[styles.email, { color: text.tertiary }]}>{user?.email}</Text>
                <Text style={[styles.timezone, { color: text.tertiary }]}>{formatTimezone(user?.timeZone)}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: bg.input, borderColor: rule.default }]} onPress={() => router.push('/(modals)/profile/edit')}>
              <Text style={[styles.editBtnText, { color: text.secondary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statsRow, { borderTopColor: rule.subtle }]}>
            <View style={[styles.statCol, { borderRightWidth: 1, borderRightColor: rule.subtle }]}>
              <Text style={[styles.statVal, { color: text.primary }]}>{lifetimeStats?.runCount ?? 0}</Text>
              <Dateline>RUNS</Dateline>
            </View>
            <View style={[styles.statCol, { borderRightWidth: 1, borderRightColor: rule.subtle }]}>
              <Text style={[styles.statVal, { color: text.primary }]}>
                {Math.round((lifetimeStats?.totalDistanceMeters ?? 0) / (unit === 'imperial' ? 1609.344 : 1000))}
              </Text>
              <Dateline>{unit === 'imperial' ? 'MI' : 'KM'}</Dateline>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: text.primary }]}>{lifetimeStats?.blockCount ?? 0}</Text>
              <Dateline>BLOCKS</Dateline>
            </View>
          </View>
        </View>

        {/* Running */}
        <Dateline style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>RUNNING</Dateline>
        <View style={[styles.card, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <TouchableOpacity style={[styles.row, { borderBottomColor: rule.subtle }]} onPress={handleDistanceUnitPress}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#1C1E10' }]} />
              <Text style={[styles.rowLabel, { color: text.primary }]}>Distance unit</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: text.tertiary }]}>{unit === 'metric' ? 'Kilometres' : 'Miles'}</Text>
              <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleRunTypePress}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#101C1E' }]} />
              <Text style={[styles.rowLabel, { color: text.primary }]}>Default run type</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: text.tertiary }]}>{defaultRunType}</Text>
              <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Dateline style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>NOTIFICATIONS</Dateline>
        <View style={[styles.card, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <TouchableOpacity style={[styles.row, { borderBottomColor: rule.subtle }]} onPress={() => setShowTimePicker(true)}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: bg.surface }]} />
              <View>
                <Text style={[styles.rowLabel, { color: text.primary }]}>Daily affirmation</Text>
                <Text style={[styles.rowSub, { color: text.tertiary }]}>{formatAffirmationTime(affirmationTime)}</Text>
              </View>
            </View>
            <CustomToggle value={prefs?.dailyPushEnabled ?? false} onValueChange={handleToggleAffirmation} />
          </TouchableOpacity>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#101618' }]} />
              <View>
                <Text style={[styles.rowLabel, { color: text.secondary }]}>Block reminders</Text>
                <Text style={[styles.rowSub, { color: text.tertiary }]}>Coming soon</Text>
              </View>
            </View>
            <CustomToggle value={false} onValueChange={() => {}} disabled={true} />
          </View>
        </View>

        {/* App */}
        <Dateline style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>APP</Dateline>
        <View style={[styles.card, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <View style={[styles.row, { borderBottomColor: rule.subtle }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: bg.surface, borderWidth: 1, borderColor: rule.subtle }]} />
              <Text style={[styles.rowLabel, { color: text.primary }]}>Appearance</Text>
            </View>
            <AppearanceControl />
          </View>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: bg.surface, borderWidth: 1, borderColor: rule.subtle }]} />
              <Text style={[styles.rowLabel, { color: text.primary }]}>About BasePhase</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: text.tertiary }]}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
              <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Dateline style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>ACCOUNT</Dateline>
        <View style={[styles.card, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleSignOut}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: bg.surface, borderWidth: 1, borderColor: rule.subtle }]} />
              <Text style={[styles.rowLabel, { color: text.primary }]}>Sign out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleDeleteAccount} style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Manrope', color: semantic.error, opacity: 0.5, fontSize: 13 }}>Delete account</Text>
        </TouchableOpacity>

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
  headerRight: { width: 40 },
  card: { borderRadius: 10, borderWidth: 1, marginHorizontal: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Fraunces_400Regular', fontSize: 20 },
  fullName: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 18, letterSpacing: -0.2 },
  email: { fontFamily: 'Manrope', fontSize: 13, marginTop: 3 },
  timezone: { fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  editBtn: { borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  editBtnText: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1 },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Fraunces_400Regular', fontSize: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 32, height: 32, borderRadius: 6 },
  rowLabel: { fontFamily: 'Manrope', fontSize: 15 },
  rowSub: { fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontFamily: 'Manrope', fontSize: 14 },
})
