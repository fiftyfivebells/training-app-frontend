import { UserResponse } from './api/userApi'

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  timeZone: string
  accountStatus: 'active' | 'inactive' | 'suspended'
  isVerified: boolean
  onboardingCompleted: boolean
}

export function userResponseToUser(ur: UserResponse): User {
  return {
    id: ur.userId,
    email: ur.email,
    firstName: ur.firstName,
    lastName: ur.lastName,
    dateOfBirth: ur.dateOfBirth,
    timeZone: ur.timeZone,
    accountStatus: ur.accountStatus,
    isVerified: ur.emailVerified,
    onboardingCompleted: ur.onboardingCompleted,
  }
}
