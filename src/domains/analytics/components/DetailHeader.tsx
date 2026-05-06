import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { RangePills } from './RangePills'

type Props = {
  title: string
}

export function DetailHeader({ title }: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { text } = useTheme()
  const { timeRange, setTimeRange } = useAnalyticsStore()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: text.secondary }]}>← Analytics</Text>
        </TouchableOpacity>
        <RangePills value={timeRange} onChange={setTimeRange} />
      </View>
      <Text style={[styles.title, { color: text.primary, fontVariationSettings: '"opsz" 144' } as any]}>{title}.</Text>
      <DoubleRule />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backLink: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 30,
    letterSpacing: -0.02 * 30,
    lineHeight: 30,
    marginBottom: 10,
  },
})
