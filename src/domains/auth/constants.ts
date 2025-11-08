import type { components } from "@/generated/api/types";

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const
};

export type DeviceInfo = components['schemas']['DeviceInfo'];
