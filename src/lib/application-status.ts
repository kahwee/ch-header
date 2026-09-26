/** Last rule-application result. This does not report whether a request matched. */
export const APPLICATION_STATUS_KEY = 'applicationStatus'

export interface ApplicationStatus {
  updatedAt: number
  state: 'off' | 'applied' | 'empty' | 'missing-access' | 'error'
  profileId: string | null
  profileName: string | null
  /** Null means Chrome's installed-rule state could not be confirmed. */
  ruleCount: number | null
  message?: string
  rulesMayBeActive?: boolean
}

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  if (!value || typeof value !== 'object') return false
  const status = value as Partial<ApplicationStatus>
  if (
    !(
      ['off', 'applied', 'empty', 'missing-access', 'error'].includes(status.state ?? '') &&
      typeof status.updatedAt === 'number' &&
      Number.isFinite(status.updatedAt) &&
      (status.profileId === null || typeof status.profileId === 'string') &&
      (status.profileName === null || typeof status.profileName === 'string') &&
      (status.ruleCount === null ||
        (typeof status.ruleCount === 'number' &&
          Number.isInteger(status.ruleCount) &&
          status.ruleCount >= 0)) &&
      (status.message === undefined || typeof status.message === 'string') &&
      (status.rulesMayBeActive === undefined || typeof status.rulesMayBeActive === 'boolean')
    )
  )
    return false

  const hasProfile = typeof status.profileId === 'string' && typeof status.profileName === 'string'
  switch (status.state) {
    case 'applied':
      return hasProfile && (status.ruleCount ?? 0) > 0 && !status.rulesMayBeActive
    case 'empty':
      return hasProfile && status.ruleCount === 0 && !status.rulesMayBeActive
    case 'off':
    case 'missing-access':
      return status.ruleCount === 0 && !status.rulesMayBeActive
    case 'error':
      return status.rulesMayBeActive ? status.ruleCount === null : status.ruleCount === 0
    default:
      return false
  }
}
