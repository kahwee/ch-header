import {
  parseAccessSites,
  requestSiteAccess,
  siteOrigins,
  suggestedAccessSites,
} from '../../lib/site-access'
import { type Profile, STORAGE_KEYS, type State } from '../../lib/types'
import type { PopupController } from './controller'
import type { PopupView } from './popup-view'

interface ProfileAccessOptions {
  controller: PopupController
  document: Document
  notify: (message: string) => void
  state: State
  view: PopupView
}

/** Owns website-permission UI and the asynchronous profile-enable workflow. */
export function setupProfileAccess(options: ProfileAccessOptions) {
  const { controller, document, notify, state, view } = options
  let enableAttempt = 0
  const accessInput = document.querySelector<HTMLInputElement>('#accessSites')!
  const accessStatus = document.querySelector<HTMLElement>('#accessStatus')!
  const accessStatusBadge = document.querySelector<HTMLElement>('#accessStatusBadge')!
  const accessStatusDetail = document.querySelector<HTMLElement>('#accessStatusDetail')!
  const grantAccess = document.querySelector<HTMLButtonElement>('#grantAccess')!
  const revokeAccess = document.querySelector<HTMLButtonElement>('#revokeAccess')!
  const profileEnabled = document.querySelector<HTMLInputElement>('#enabled')!

  function setProfileEnabled(id: string, enabled: boolean): void {
    const attempt = ++enableAttempt
    const profile = state.profiles.find((item) => item.id === id)
    if (!profile) return
    if (!enabled) {
      controller.onSetProfileEnabled(id, false)
      return
    }
    try {
      const sites = suggestedAccessSites(profile)
      if (!sites.length) throw new Error('Add allowed sites before turning this profile on.')
      profile.accessSites = sites
      const snapshot = JSON.stringify(profile)
      const request = requestSiteAccess(sites)
      view.select(state.current?.id ?? null)
      void request
        .then((granted) => {
          if (attempt !== enableAttempt) return
          const current = state.profiles.find((item) => item.id === id)
          if (!current || JSON.stringify(current) !== snapshot) {
            notify('Profile changed while requesting access. Turn it on again.')
          } else if (!granted) {
            notify('Website access was not granted. The profile stays off.')
          } else {
            controller.onSetProfileEnabled(id, true)
          }
        })
        .catch((error) =>
          notify(
            `Could not request website access. ${error instanceof Error ? error.message : 'Try reopening the popup.'} The profile stays off.`
          )
        )
    } catch (error) {
      view.select(state.current?.id ?? null)
      notify(error instanceof Error ? error.message : 'Check allowed sites.')
    }
  }

  function refresh(): void {
    chrome.permissions.getAll((grants) => {
      const origins = grants.origins ?? []
      document.querySelector<HTMLElement>('#emptyRevokeAccess')!.hidden = !origins.length
      if (!accessStatus.isConnected) return
      revokeAccess.hidden = !origins.length

      let sites: string[] = []
      try {
        if (state.current) sites = suggestedAccessSites(state.current)
      } catch {
        // The input's validation message handles malformed saved values.
      }
      const requiredOrigins = sites.length ? siteOrigins(sites) : []
      const approved =
        requiredOrigins.length > 0 && requiredOrigins.every((origin) => origins.includes(origin))
      accessStatus.dataset.state = approved ? 'approved' : sites.length ? 'needed' : 'empty'
      accessStatusBadge.textContent = approved
        ? 'Approved'
        : sites.length
          ? 'Approval needed'
          : 'No sites'
      accessStatusDetail.textContent = approved
        ? `Chrome access is ready for ${sites.join(', ')}.`
        : sites.length
          ? `Approve ${sites.join(', ')} before enabling this profile.`
          : 'Add at least one hostname to continue.'
      grantAccess.hidden = approved || !sites.length
      profileEnabled.disabled = !approved
      profileEnabled.title = approved
        ? 'Enable this profile'
        : 'Approve this profile’s website access first'
    })
  }

  refresh()
  chrome.permissions.onAdded.addListener(refresh)
  chrome.permissions.onRemoved.addListener(refresh)

  function saveAllowedSites(): boolean {
    if (!state.current) return false
    try {
      state.current.accessSites = parseAccessSites(accessInput.value)
      ++enableAttempt
      controller.onSetProfileEnabled(state.current.id, false)
      refresh()
      notify('Website access scope saved.')
      return true
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Check allowed sites.')
      view.select(state.current.id)
      return false
    }
  }

  accessInput.addEventListener('change', saveAllowedSites)
  accessInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    saveAllowedSites()
  })
  document.querySelector('#saveAccessSites')!.addEventListener('click', saveAllowedSites)
  grantAccess.addEventListener('click', () => {
    const profile = state.current
    if (!profile) return
    let sites: string[]
    try {
      sites = parseAccessSites(accessInput.value)
      if (!sites.length) throw new Error('Add at least one hostname before requesting access.')
      profile.accessSites = sites
      ++enableAttempt
      controller.onSetProfileEnabled(profile.id, false)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Check allowed sites.')
      return
    }
    void requestSiteAccess(sites)
      .then((granted) => {
        refresh()
        notify(
          granted
            ? 'Website access approved. Turn this profile on when you are ready.'
            : 'Website access was not granted.'
        )
      })
      .catch((error) =>
        notify(
          `Could not request website access. ${error instanceof Error ? error.message : 'Try reopening the popup.'}`
        )
      )
  })

  for (const button of document.querySelectorAll('[data-revoke-access]')) {
    button.addEventListener('click', () => {
      ++enableAttempt
      void chrome.runtime
        .sendMessage({ type: 'revokeSiteAccess' })
        .then((result) => {
          if (!result?.ok) return notify('Could not revoke access. Try again.')
          for (const profile of state.profiles) profile.enabled = false
          view.select(state.current?.id ?? null)
          view.renderList()
          notify('Website access revoked. All profiles are off.')
        })
        .catch(() => notify('Could not revoke access. Try again.'))
    })
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[STORAGE_KEYS.PROFILES]) return
    const saved = changes[STORAGE_KEYS.PROFILES].newValue as Profile[]
    let changed = false
    for (const profile of state.profiles) {
      if (profile.enabled && saved.find((item) => item.id === profile.id)?.enabled === false) {
        profile.enabled = false
        changed = true
      }
    }
    if (changed) {
      view.select(state.current?.id ?? null)
      view.renderList()
    }
  })

  return { refresh, setProfileEnabled }
}
