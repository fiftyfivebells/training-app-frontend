import { useEffect } from 'react'

import { useSetTheme } from '@/theme/ThemeProvider'
import { verdeModernTheme } from '@/theme/themes/verdeModern'

import { BLOCK_TYPE_CONFIG } from '../blocks.types'
import { useActiveBlock } from './useActiveBlock'

export function useBlockThemeSync() {
  const { data: activeBlock } = useActiveBlock()
  const setTheme = useSetTheme()

  useEffect(() => {
    if (activeBlock) {
      setTheme(BLOCK_TYPE_CONFIG[activeBlock.blockType].theme)
    } else {
      setTheme(verdeModernTheme)
    }
  }, [activeBlock, setTheme])
}
