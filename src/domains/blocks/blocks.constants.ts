export const blocksKeys = {
  all: ['blocks'] as const,
  active: () => [...blocksKeys.all, 'active'] as const,
  list: () => [...blocksKeys.all, 'list'] as const,
  details: () => [...blocksKeys.all, 'detail'] as const,
  detail: (blockId: string) => [...blocksKeys.details(), blockId] as const,
  affirmation: () => [...blocksKeys.all, 'affirmation'] as const,
}
