import { router } from 'expo-router'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useActiveBlock } from '../hooks/useActiveBlock'
import { useCompletedBlocks } from '../hooks/useCompletedBlocks'
import { PastBlockCard } from '../components/PastBlockCard'

export function BlocksScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: activeBlock, isLoading: activeLoading } = useActiveBlock()
  const { data: completedBlocks = [], isLoading: pastLoading } = useCompletedBlocks()
  const { data: allRuns = [] } = useRuns()
  const { unit: distUnit } = useDistanceUnit()

  const isLoading = activeLoading || pastLoading
  const isEmpty = !isLoading && !activeBlock && completedBlocks.length === 0

  const openBlockCreate = () => {
    if (activeBlock) {
      const label = BLOCK_TYPE_CONFIG[activeBlock.blockType].label
      Alert.alert(
        'Start a new block?',
        `Starting a new block will end your current ${label} block. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => router.push('/(modals)/block-create'),
          },
        ],
      )
    } else {
      router.push('/(modals)/block-create')
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background.base,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Blocks</Text>
        <Pressable
          onPress={openBlockCreate}
          style={[
            styles.newBlockBtn,
            {
              backgroundColor: colors.copper.subtle,
              borderColor: colors.copper.muted,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="New block"
        >
          <Text style={[styles.newBlockBtnText, { color: colors.copper.default }]}>
            + New block
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full empty state */}
        {isEmpty && (
          <View style={styles.fullEmpty}>
            <Text
              style={[
                styles.fullEmptyText,
                { color: colors.text.secondary, fontFamily: 'Fraunces_400Italic' },
              ]}
            >
              Your training history will appear here.
            </Text>
          </View>
        )}

        {/* Current / Active Section */}
        {activeBlock && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text.tertiary }]}>
              ACTIVE
            </Text>
            <PastBlockCard
              block={activeBlock}
              runs={allRuns.filter((r) => r.blockId === activeBlock.id)}
              distUnit={distUnit}
            />
          </View>
        )}

        {/* Past blocks section */}
        {completedBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text.tertiary }]}>
              PAST BLOCKS
            </Text>
            {completedBlocks.map((block) => (
              <PastBlockCard
                key={block.id}
                block={block}
                runs={allRuns.filter((r) => r.blockId === block.id)}
                distUnit={distUnit}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  newBlockBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  newBlockBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  fullEmpty: {
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  fullEmptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
})
