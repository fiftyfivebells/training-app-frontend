// app/test-components.tsx (temporary file for testing)
import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/ThemeProvider'

import { Button, Input, Select } from '../src/components/ui'

export default function TestComponentsScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [units, setUnits] = useState('metric')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const theme = useTheme()

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: theme.spacing.lg }}
      >
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={password.length > 0 && password.length < 8 ? 'Too short' : undefined}
        />

        <Select
          label="Preferred Units"
          value={units}
          onValueChange={setUnits}
          options={[
            { label: 'Metric (km)', value: 'metric' },
            { label: 'Imperial (miles)', value: 'imperial' },
          ]}
        />

        <Button title="Primary Button" onPress={handleSubmit} loading={loading} />

        <Button
          title="Secondary Button"
          onPress={() => {
            console.log('secondary')
          }}
          variant="secondary"
        />

        <Button
          title="Outline Button"
          onPress={() => {
            console.log('outline')
          }}
          variant="outline"
        />

        <Button title="Disabled Button" onPress={() => {}} disabled />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
})
