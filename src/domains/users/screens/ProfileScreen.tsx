import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  BackHandler,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useGetCurrentUser } from '@/domains/users/hooks/useGetCurrentUser'
import { useGetUserPreferences } from '@/domains/users/hooks/useGetUserPreferences'
import { useUpdatePreferences } from '@/domains/users/hooks/useUpdatePreferences'
import { useDistanceUnitPreference } from '@/domains/users/hooks/useDistanceUnitPreference'
import { useLogout } from '@/domains/auth/hooks/useLogout'
import { useStravaStatus } from '@/domains/strava/hooks/useStravaStatus'
import { useStravaConnect } from '@/domains/strava/hooks/useStravaConnect'
import { useStravaDisconnect } from '@/domains/strava/hooks/useStravaDisconnect'
import { STRAVA_ORANGE } from '@/domains/strava/strava.constants'
import { Dateline, DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { AppearanceControl } from '../components/AppearanceControl'
import { CustomToggle } from '../components/CustomToggle'

// ─── Shared primitives ────────────────────────────────────────────────────────

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  const { bg, rule } = useTheme()
  return (
    <View style={styles.section}>
      <Dateline style={styles.sectionLabel}>{label}</Dateline>
      <View style={[styles.sectionCard, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
        {children}
      </View>
    </View>
  )
}

type SettingsRowProps = {
  label: string
  value?: string
  danger?: boolean
  accent?: boolean
  onPress?: () => void
  showChevron?: boolean
  topBorder?: boolean
  right?: React.ReactNode
}

function SettingsRow({
  label,
  value,
  danger,
  accent: accentProp,
  onPress,
  showChevron = true,
  topBorder = true,
  right,
}: SettingsRowProps) {
  const { text, rule, accent, semantic } = useTheme()
  const labelColor = danger ? semantic.error : accentProp ? accent.default : text.primary

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.row,
        topBorder && { borderTopWidth: 1, borderTopColor: rule.subtle },
      ]}
    >
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.rowRight}>
        {right ?? null}
        {value ? (
          <Text style={[styles.rowValue, { color: text.tertiary }]}>{value}</Text>
        ) : null}
        {showChevron && onPress && !right ? (
          <Ionicons name="chevron-forward" size={14} color={text.tertiary} />
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

function ToggleRow({
  label,
  sublabel,
  value,
  onValueChange,
  topBorder = true,
  disabled,
}: {
  label: string
  sublabel?: string
  value: boolean
  onValueChange: (v: boolean) => void
  topBorder?: boolean
  disabled?: boolean
}) {
  const { text, rule } = useTheme()
  return (
    <View
      style={[
        styles.toggleRow,
        topBorder && { borderTopWidth: 1, borderTopColor: rule.subtle },
      ]}
    >
      <View style={styles.toggleRowText}>
        <Text style={[styles.rowLabel, { color: text.primary }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: text.tertiary }]}>{sublabel}</Text>
        ) : null}
      </View>
      <CustomToggle value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  )
}

// ─── Distance unit control ────────────────────────────────────────────────────

function DistanceUnitControl() {
  const { bg, rule, text, accent } = useTheme()
  const { unit, setUnit } = useDistanceUnitPreference()
  const options = [
    { label: 'km', value: 'metric' as const },
    { label: 'mi', value: 'imperial' as const },
  ]
  return (
    <View style={[styles.segmentControl, { borderColor: rule.default }]}>
      {options.map((opt, i) => {
        const active = unit === opt.value
        return (
          <Pressable
            key={opt.value}
            onPress={() => setUnit(opt.value)}
            style={[
              styles.segment,
              active && { backgroundColor: accent.default },
              i > 0 && { borderLeftWidth: 1, borderLeftColor: rule.default },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? bg.base : text.tertiary, fontWeight: active ? '600' : '400' },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

// ─── Sub-screen shell ─────────────────────────────────────────────────────────

function SubScreen({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  const { bg, text } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.subScreen, { backgroundColor: bg.base }]}>
      <View style={[styles.subHeader, { paddingTop: insets.top + 10 }]}>
        <View style={styles.subHeaderRow}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.backLink, { color: text.secondary }]}>← Settings</Text>
          </TouchableOpacity>
          <Dateline>{title}</Dateline>
          <View style={{ width: 64 }} />
        </View>
        <DoubleRule />
      </View>
      <ScrollView
        style={styles.subScroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  )
}

// ─── Notifications sub-screen ─────────────────────────────────────────────────

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { bg, text, rule, accent } = useTheme()
  const { data: prefs } = useGetUserPreferences()
  const { mutate: updatePrefs } = useUpdatePreferences()

  const [masterOn, setMasterOn] = useState(prefs?.dailyPushEnabled ?? false)
  const [items, setItems] = useState([
    { id: 'weekly',    label: 'Weekly summary',   sublabel: "A digest of your week's running",   on: true  },
    { id: 'milestone', label: 'Block milestones', sublabel: 'Halfway point and final week',       on: true  },
    { id: 'streak',    label: 'Streak reminder',  sublabel: 'When a run streak is at risk',       on: false },
    { id: 'logprompt', label: 'Log run prompt',   sublabel: 'Gentle nudge if no run logged',      on: false },
  ])
  const activeCount = items.filter((i) => i.on).length

  const toggle = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, on: !it.on } : it)))

  const handleMasterToggle = (val: boolean) => {
    setMasterOn(val)
    updatePrefs({ dailyPushEnabled: val })
  }

  const ac = accent.default

  return (
    <SubScreen title="NOTIFICATIONS" onBack={onBack}>
      {/* Master toggle card */}
      <View
        style={[
          styles.masterCard,
          {
            backgroundColor: ac + '0F',
            borderTopColor: rule.subtle,
            borderRightColor: rule.subtle,
            borderBottomColor: rule.subtle,
            borderLeftColor: masterOn ? ac : rule.strong,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.masterLabel, { color: text.primary }]}>Allow notifications</Text>
          <Text style={[styles.sublabel, { color: text.tertiary, marginTop: 2 }]}>
            {masterOn ? `${activeCount} type${activeCount !== 1 ? 's' : ''} enabled` : 'All notifications off'}
          </Text>
        </View>
        <CustomToggle value={masterOn} onValueChange={handleMasterToggle} />
      </View>

      {/* Per-type list */}
      <SettingsSection label="Notification types">
        {items.map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.notifRow,
              i > 0 && { borderTopWidth: 1, borderTopColor: rule.subtle },
              { opacity: masterOn ? 1 : 0.4 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: text.primary }]}>{item.label}</Text>
              <Text style={[styles.sublabel, { color: text.tertiary, marginTop: 2 }]}>
                {item.sublabel}
              </Text>
            </View>
            <CustomToggle
              value={item.on && masterOn}
              onValueChange={() => masterOn && toggle(item.id)}
              disabled={!masterOn}
            />
          </View>
        ))}
      </SettingsSection>

      {/* iOS permissions note */}
      <View style={styles.notifNote}>
        <View style={[styles.notifNoteInner, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
          <Text style={[styles.notifNoteText, { color: text.tertiary }]}>
            Notifications are managed by iOS. To change system-level permissions, go to{' '}
            <Text style={{ color: text.secondary, fontWeight: '500' }}>Settings → Base Phase</Text>.
          </Text>
        </View>
      </View>
    </SubScreen>
  )
}

// ─── Connections sub-screen ───────────────────────────────────────────────────

function ConnectionsScreen({ onBack }: { onBack: () => void }) {
  const { bg, text, rule, semantic } = useTheme()
  const { data: status } = useStravaStatus()
  const { mutate: connect, isPending: isConnecting } = useStravaConnect()
  const { mutate: disconnect, isPending: isDisconnecting } = useStravaDisconnect()

  const isConnected = status?.connected ?? false

  const handleConnect = () => {
    connect(undefined, {
      onError: (err) => {
        if (err.message === 'cancelled') return
        Alert.alert('Connection failed', err.message)
      },
    })
  }

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Strava?',
      'Your runs will no longer sync automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () =>
            disconnect(undefined, {
              onError: () => Alert.alert('Error', 'Could not disconnect. Please try again.'),
            }),
        },
      ],
    )
  }

  return (
    <SubScreen title="CONNECTIONS" onBack={onBack}>
      <View style={styles.connIntro}>
        <Text style={[styles.connTitle, { color: text.primary }]}>Connected apps.</Text>
        <Text style={[styles.connSub, { color: text.secondary }]}>
          Sync your runs automatically from third-party services.
        </Text>
      </View>

      <View style={[styles.stravaCard, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
        <View style={styles.stravaHeader}>
          <View style={[styles.stravaLogo, { backgroundColor: STRAVA_ORANGE }]}>
            <Ionicons name="fitness" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stravaName, { color: text.primary }]}>Strava</Text>
            <View style={styles.stravaStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? semantic.success : text.tertiary },
                ]}
              />
              <Text style={[styles.statusText, { color: isConnected ? semantic.success : text.tertiary }]}>
                {isConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>
          {isConnected ? (
            <TouchableOpacity
              onPress={handleDisconnect}
              disabled={isDisconnecting}
              style={[styles.stravaConnectBtn, { borderWidth: 1, borderColor: semantic.error }]}
            >
              <Text style={[styles.stravaConnectLabel, { color: semantic.error }]}>
                {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleConnect}
              disabled={isConnecting}
              style={[styles.stravaConnectBtn, { backgroundColor: isConnecting ? STRAVA_ORANGE + '80' : STRAVA_ORANGE }]}
            >
              <Text style={styles.stravaConnectLabel}>
                {isConnecting ? 'Connecting…' : 'Connect'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Coming soon */}
      <View style={[styles.comingSoon, { borderColor: rule.default }]}>
        <View style={[styles.comingSoonIcon, { borderColor: rule.strong }]}>
          <Ionicons name="add" size={16} color={text.tertiary} />
        </View>
        <View>
          <Text style={[styles.comingSoonTitle, { color: text.tertiary }]}>More apps coming soon</Text>
          <Text style={[styles.comingSoonSub, { color: text.tertiary }]}>Garmin, Apple Health, Wahoo</Text>
        </View>
      </View>
    </SubScreen>
  )
}

// ─── Feedback sub-screen ──────────────────────────────────────────────────────

function FeedbackScreen({ onBack }: { onBack: () => void }) {
  const { bg, text, rule, accent } = useTheme()
  const [body, setBody] = useState('')
  const inputRef = useRef<TextInput>(null)

  const handleSubmit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    const encoded = encodeURIComponent(trimmed)
    Linking.openURL(`mailto:stephen@basephase.app?subject=Base%20Phase%20Feedback&body=${encoded}`)
  }

  return (
    <SubScreen title="FEEDBACK" onBack={onBack}>
      <View style={styles.feedbackIntro}>
        <Text style={[styles.connTitle, { color: text.primary }]}>Share your thoughts.</Text>
        <Text style={[styles.connSub, { color: text.secondary }]}>
          What's working? What isn't? We read everything.
        </Text>
      </View>

      <View style={styles.feedbackInputWrap}>
        <TextInput
          ref={inputRef}
          value={body}
          onChangeText={setBody}
          placeholder="Write your feedback here…"
          placeholderTextColor={text.tertiary}
          multiline
          textAlignVertical="top"
          style={[
            styles.feedbackInput,
            {
              backgroundColor: bg.input,
              borderColor: rule.default,
              color: text.primary,
            },
          ]}
          autoFocus
        />
      </View>

      <View style={styles.feedbackActions}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!body.trim()}
          style={[
            styles.feedbackSubmitBtn,
            { backgroundColor: body.trim() ? accent.default : rule.strong },
          ]}
        >
          <Text
            style={[
              styles.feedbackSubmitLabel,
              { color: body.trim() ? '#F4EFE4' : text.disabled },
            ]}
          >
            Send feedback
          </Text>
        </TouchableOpacity>
      </View>
    </SubScreen>
  )
}

// ─── Main settings screen ─────────────────────────────────────────────────────

type Screen = 'main' | 'notifications' | 'connections' | 'feedback'

export function ProfileScreen() {
  const { bg, text, rule, accent } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: user } = useGetCurrentUser()
  const { data: prefs } = useGetUserPreferences()
  const { unit } = useDistanceUnitPreference()
  const { mutate: logout } = useLogout()
  const { data: stravaStatus } = useStravaStatus()

  const [screen, setScreen] = useState<Screen>('main')
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: screen === 'main' })
  }, [screen, navigation])

  useEffect(() => {
    if (screen === 'main') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen('main')
      return true
    })
    return () => sub.remove()
  }, [screen])

  if (screen === 'notifications') {
    return <NotificationsScreen onBack={() => setScreen('main')} />
  }
  if (screen === 'connections') {
    return <ConnectionsScreen onBack={() => setScreen('main')} />
  }
  if (screen === 'feedback') {
    return <FeedbackScreen onBack={() => setScreen('main')} />
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : ''

  const handleSignOut = () => {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ])
  }

const ac = accent.default

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.backLink, { color: text.secondary }]}>← Back</Text>
          </TouchableOpacity>
          <Dateline>SETTINGS</Dateline>
          <View style={{ width: 48 }} />
        </View>
        <DoubleRule />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Profile hero */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: ac + '0F',
              borderTopColor: rule.subtle,
              borderRightColor: rule.subtle,
              borderBottomColor: rule.subtle,
              borderLeftColor: ac,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: ac + '20', borderColor: ac + '50' }]}>
            <Text style={[styles.avatarText, { color: ac }]}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.fullName, { color: text.primary }]} numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.email, { color: text.tertiary }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/profile/edit')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={14} color={text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Training */}
        <SettingsSection label="Training">
          <SettingsRow
            label="Distance unit"
            topBorder={false}
            showChevron={false}
            right={<DistanceUnitControl />}
          />
          <SettingsRow label="Pace format" value={unit === 'metric' ? 'min/km' : 'min/mi'} />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection label="Appearance">
          <SettingsRow
            label="Theme"
            topBorder={false}
            showChevron={false}
            right={<AppearanceControl />}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection label="Notifications">
          <SettingsRow
            label="Notifications"
            value={prefs?.dailyPushEnabled ? '1 on' : 'Off'}
            onPress={() => setScreen('notifications')}
            topBorder={false}
          />
        </SettingsSection>

        {/* Connections */}
        <SettingsSection label="Connections">
          <SettingsRow
            label="Connected apps"
            value={stravaStatus?.connected ? 'Strava' : 'None'}
            onPress={() => setScreen('connections')}
            topBorder={false}
          />
        </SettingsSection>

        {/* TODO: add data export (CSV / JSON) when ready */}

        {/* About */}
        <SettingsSection label="About">
          <SettingsRow
            label="Version"
            value={Constants.expoConfig?.version ?? '1.0.0'}
            showChevron={false}
            topBorder={false}
          />
          {/* TODO: add privacy policy and terms of service links once pages are ready */}
          <SettingsRow label="Give feedback" onPress={() => setScreen('feedback')} accent />
        </SettingsSection>

        {/* Account */}
        <SettingsSection label="Account">
          <SettingsRow label="Sign out" onPress={handleSignOut} topBorder={false} />
        </SettingsSection>
      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Main header
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backLink: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14, lineHeight: 20 },
  scroll: { paddingTop: 20 },

  // Sub-screen
  subScreen: { flex: 1 },
  subHeader: { paddingHorizontal: 20 },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subScroll: { flex: 1 },

  // Profile hero card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 18,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontFamily: 'Manrope', fontWeight: '700', fontSize: 16 },
  profileInfo: { flex: 1, minWidth: 0 },
  fullName: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 20,
    letterSpacing: -0.01 * 20,
    lineHeight: 24,
    marginBottom: 3,
  },
  email: { fontFamily: 'Manrope', fontSize: 12 },

  // Section
  section: { marginBottom: 24 },
  sectionLabel: { paddingHorizontal: 20, marginBottom: 8 },
  sectionCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 12,
  },
  rowLabel: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '500', flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  rowValue: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 14 },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 12,
  },
  toggleRowText: { flex: 1 },
  sublabel: { fontFamily: 'Manrope', fontSize: 11, lineHeight: 15 },

  // Segment control (distance unit / theme)
  segmentControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  segmentLabel: {
    fontFamily: 'Manrope',
    fontSize: 12,
    letterSpacing: 0.04 * 12,
  },

  // Notifications
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 20,
    marginBottom: 24,
    padding: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  masterLabel: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '600' },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  notifNote: { paddingHorizontal: 20 },
  notifNoteInner: { padding: 14, borderWidth: 1, borderRadius: 4 },
  notifNoteText: { fontFamily: 'Manrope', fontSize: 11, lineHeight: 18 },

  // Connections
  connIntro: { padding: 20, paddingBottom: 4 },
  connTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    letterSpacing: -0.01 * 22,
    marginBottom: 6,
  },
  connSub: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13, lineHeight: 20 },
  stravaCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stravaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  stravaLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stravaName: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  stravaStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Manrope', fontSize: 11 },
  stravaConnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexShrink: 0,
  },
  stravaConnectLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.06 * 11,
    textTransform: 'uppercase',
    color: '#141210',
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  comingSoonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  comingSoonTitle: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '500' },
  comingSoonSub: { fontFamily: 'Manrope', fontSize: 11, marginTop: 1 },

  // Feedback
  feedbackIntro: { padding: 20, paddingBottom: 4 },
  feedbackInputWrap: { paddingHorizontal: 16, paddingTop: 20 },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    fontFamily: 'Manrope',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 180,
  },
  feedbackActions: { paddingHorizontal: 16, paddingTop: 16 },
  feedbackSubmitBtn: {
    borderRadius: 4,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackSubmitLabel: {
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.04 * 13,
    textTransform: 'uppercase',
  },
})
