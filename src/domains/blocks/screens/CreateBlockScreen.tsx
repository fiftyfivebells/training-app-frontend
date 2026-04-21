import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { useAlert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { ThemedText } from '@/components/ui/ThemedText'
import { BLOCK_TYPE_CONFIG, BlockType } from '@/domains/blocks/blocks.types'
import { useCreateBlock } from '@/domains/blocks/hooks/useCreateBlock'
import { useTheme } from '@/theme/useTheme'

const BLOCK_TYPES: BlockType[] = [
  'base_building',
  'race_specific',
  'peaking',
  'tapering',
  'recovery',
  'off_season',
]

type FormValues = {
  blockType: BlockType | ''
  name: string
  startDate: string
  endDate: string
  notes: string
}

function toDate(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function fromDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function SectionLabel({ children }: { children: string }) {
  const { colors, space } = useTheme()
  return (
    <ThemedText
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: space[2],
      }}
    >
      {children}
    </ThemedText>
  )
}

function FieldError({ message }: { message?: string }) {
  const { colors, space } = useTheme()
  if (!message) return null
  return (
    <ThemedText
      style={{
        fontSize: 13,
        color: colors.text.tertiary,
        marginTop: space[1],
      }}
    >
      {message}
    </ThemedText>
  )
}

export function CreateBlockScreen() {
  const router = useRouter()
  const { colors, space, radius } = useTheme()
  const { alert } = useAlert()
  const createBlock = useCreateBlock()

  const today = useMemo(() => fromDate(new Date()), [])

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      blockType: '',
      name: '',
      startDate: today,
      endDate: '',
      notes: '',
    },
  })

  const selectedBlockType = watch('blockType')
  const startDateValue = watch('startDate')
  const nameValue = watch('name')

  const onSubmit = (values: FormValues) => {
    if (!values.blockType) return
    createBlock.mutate(
      {
        blockType: values.blockType,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => router.replace('/(drawer)/blocks'),
        onError: (error) => {
          if (error.isConflict) {
            alert(
              'Active Block Exists',
              'You already have an active training block. Complete it before starting a new one.',
              [{ text: 'OK' }],
            )
          } else {
            alert('Error', 'Something went wrong. Please try again.', [{ text: 'OK' }])
          }
        },
      },
    )
  }

  const inputStyle = {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    borderWidth: 1 as const,
    color: colors.text.primary,
    fontSize: 15,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  }

  return (
    <Screen>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: space[1],
        }}
      >
        Start a Block
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 15,
          color: colors.text.secondary,
          marginBottom: space[8],
        }}
      >
        Choose your training phase.
      </ThemedText>

      {/* Block Type Selector */}
      <View style={{ marginBottom: space[6] }}>
        <SectionLabel>Block Type</SectionLabel>
        <Controller
          control={control}
          name="blockType"
          rules={{ required: 'Please select a block type' }}
          render={({ field: { value, onChange } }) => (
            <View>
              {BLOCK_TYPES.map((blockType, index) => {
              const config = BLOCK_TYPE_CONFIG[blockType]
              const isSelected = value === blockType
              return (
                <TouchableOpacity
                  key={blockType}
                  activeOpacity={0.8}
                  style={[
                    styles.blockTypeCard,
                    {
                      backgroundColor: isSelected
                        ? `${config.accentColor}20`
                        : colors.background.surface,
                      borderColor: isSelected
                        ? config.accentColor
                        : colors.border.default,
                      borderLeftColor: config.accentColor,
                      borderRadius: radius.md,
                      padding: space[4],
                      marginBottom: index < BLOCK_TYPES.length - 1 ? space[2] : 0,
                    },
                  ]}
                  onPress={() => {
                    onChange(blockType)
                    const isDefaultName =
                      !nameValue ||
                      BLOCK_TYPES.some((bt) => BLOCK_TYPE_CONFIG[bt].label === nameValue)
                    if (isDefaultName) {
                      setValue('name', config.label)
                    }
                  }}
                >
                  <View style={styles.blockTypeCardInner}>
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: colors.text.primary,
                        }}
                      >
                        {config.label}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 13,
                          color: colors.text.secondary,
                        }}
                      >
                        {config.description}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={config.accentColor} />
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
            </View>
          )}
        />
        <FieldError message={errors.blockType?.message} />
      </View>

      {/* Block Name */}
      <View style={{ marginBottom: space[6] }}>
        <SectionLabel>Block Name</SectionLabel>
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={[
                inputStyle,
                errors.name && { borderColor: colors.semantic.errorFg },
              ]}
              placeholderTextColor={colors.text.tertiary}
              placeholder="Name your block"
            />
          )}
        />
        <FieldError message={errors.name?.message} />
      </View>

      {/* Start Date */}
      <View style={{ marginBottom: space[6] }}>
        <Controller
          control={control}
          name="startDate"
          rules={{ required: 'Start date is required' }}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              label="Start Date"
              value={toDate(value)}
              onChange={(date) => {
                onChange(fromDate(date))
                trigger('endDate')
              }}
              maximumDate={toDate(today) ?? undefined}
              error={errors.startDate?.message}
            />
          )}
        />
      </View>

      {/* End Date */}
      <View style={{ marginBottom: space[6] }}>
        <Controller
          control={control}
          name="endDate"
          rules={{
            required: 'End date is required',
            validate: (value) =>
              !startDateValue || value > startDateValue || 'End date must be after start date',
          }}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              label="End Date"
              value={toDate(value)}
              onChange={(date) => onChange(fromDate(date))}
              minimumDate={toDate(startDateValue) ?? undefined}
              error={errors.endDate?.message}
              helperText={
                selectedBlockType
                  ? `Recommended: ${BLOCK_TYPE_CONFIG[selectedBlockType].recommendedWeeks[0]}–${BLOCK_TYPE_CONFIG[selectedBlockType].recommendedWeeks[1]} weeks`
                  : undefined
              }
            />
          )}
        />
      </View>

      {/* Notes */}
      <View style={{ marginBottom: space[8] }}>
        <SectionLabel>Notes (optional)</SectionLabel>
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              style={[
                inputStyle,
                { minHeight: 96, textAlignVertical: 'top', paddingTop: space[2] },
              ]}
              placeholderTextColor={colors.text.tertiary}
              placeholder="What are you training for? Any goals for this block?"
            />
          )}
        />
      </View>

      <Button onPress={handleSubmit(onSubmit)} loading={createBlock.isPending} size="lg">
        Start Block
      </Button>
    </Screen>
  )
}


const styles = StyleSheet.create({
  blockTypeCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  blockTypeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
