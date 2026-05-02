import { useEffect } from 'react'

import { useSetAccentOverride } from '@/theme/ThemeContext'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useActiveBlock } from './useActiveBlock'

export function useBlockThemeSync() {
  const { data: activeBlock } = useActiveBlock()
  const setAccentOverride = useSetAccentOverride()

  useEffect(() => {
    if (activeBlock) {
      const config = BLOCK_TYPE_CONFIG[activeBlock.blockType]
      setAccentOverride(config.accentColor)
    } else {
      setAccentOverride(null)
    }
  }, [activeBlock?.blockType, setAccentOverride])
}
