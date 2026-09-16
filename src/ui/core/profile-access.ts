import { parseAccessSites, requestSiteAccess, suggestedAccessSites } from '../../lib/site-access'
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

  function renderGrants(): void {
    chrome.permissions.getAll((grants) => {
      document.querySelector<HTMLElement>('#emptyRevokeAccess')!.hidden = !grants.origins?.length
      document.querySelector('#grantedSites')!.textContent = grants.origins?.length
        ? `Granted to ChHeader: ${[
            ...new Set(
              grants.origins.map((origin) =>
                origin.replace(/^https?:\/\//, '').replace(/\/\*$/, '')
              )
            ),
          ].join(', ')}`
        : 'No website access granted.'
    })
  }

  renderGrants()
  chrome.permissions.onAdded.addListener(renderGrants)
  chrome.permissions.onRemoved.addListener(renderGrants)

  document.querySelector<HTMLInputElement>('#accessSites')!.addEventListener('change', (event) => {
    if (!state.current) return
    try {
      state.current.accessSites = parseAccessSites((event.target as HTMLInputElement).value)
      ++enableAttempt
      controller.onSetProfileEnabled(state.current.id, false)
      notify('Allowed sites saved. Turn the profile on to approve access.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Check allowed sites.')
      view.select(state.current.id)
    }
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

  return { setProfileEnabled }
}
