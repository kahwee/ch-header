import {
  APPLICATION_STATUS_KEY,
  type ApplicationStatus,
  isApplicationStatus,
} from '../../lib/application-status'
import type { State } from '../../lib/types'

/** Shows runtime outcomes separately from the selected profile's enabled switch. */
export function setupApplicationStatus(
  document: Document,
  state: State,
  apply: () => Promise<string | null>
) {
  const element = document.querySelector<HTMLElement>('#applicationStatus')!
  const retryAction = document.querySelector<HTMLElement>('#retryAction')!
  const retryButton = document.querySelector<HTMLButtonElement>('#retry')!
  let status: ApplicationStatus | undefined
  let saveState: 'idle' | 'saving' | 'waiting' | 'failed' = 'idle'
  let saveVersion = 0
  let statusVersion = 0
  let applyError: string | null = null
  let initialReadComplete = false
  let statusReadFailed = false
  let retryHadFocus = false

  function render(): void {
    const profile = state.current
    element.dataset.state = 'neutral'
    let unconfirmed = false
    if (saveState === 'failed') {
      element.textContent = 'Not saved. Keep this popup open and choose Retry.'
      element.dataset.state = 'error'
    } else if (saveState === 'saving') element.textContent = 'Saving changes…'
    else if (saveState === 'waiting') element.textContent = 'Saved · Waiting for Chrome…'
    else if (applyError) {
      element.textContent = applyError
      element.dataset.state = 'error'
    } else if (statusReadFailed) {
      element.textContent = 'Could not read application status. Choose Retry to check.'
      element.dataset.state = 'error'
    } else if (
      status?.state === 'error' &&
      (status.rulesMayBeActive || status.profileId === null)
    ) {
      element.textContent =
        status.message ??
        (status.rulesMayBeActive
          ? 'Could not confirm rules stopped. Choose Retry.'
          : 'Rules could not be applied. Check website access, URL rules and headers.')
      element.dataset.state = 'error'
    } else if (status && status.profileId === profile?.id && status.state !== 'off') {
      element.dataset.state = status.state
      element.textContent =
        status.state === 'applied'
          ? `Saved · Applied · ${status.ruleCount} URL rule${status.ruleCount === 1 ? '' : 's'}. Reload the page to test.`
          : (status.message ?? 'Check website access, URL rules and headers.')
    } else if (profile?.enabled) {
      unconfirmed = initialReadComplete
      element.textContent = initialReadComplete
        ? 'Status not confirmed. Choose Retry to check.'
        : 'Checking application status…'
    } else
      element.textContent = 'Saved · Off · Turn on after choosing sites, URL rules and headers.'

    const pending = saveState === 'saving' || saveState === 'waiting'
    const needsRetry = element.dataset.state === 'error' || unconfirmed
    // Keep a focused Retry in place while it runs, then return focus to its result.
    const showRetry = needsRetry || (pending && !retryAction.hidden)
    if (pending && document.activeElement === retryButton) retryHadFocus = true
    if (
      !showRetry &&
      (document.activeElement === retryButton ||
        (retryHadFocus && document.activeElement === document.body))
    )
      element.focus()
    if (!pending) retryHadFocus = false
    retryAction.hidden = !showRetry
    retryButton.disabled = pending
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[APPLICATION_STATUS_KEY]) return
    statusVersion++
    initialReadComplete = true
    statusReadFailed = false
    const value: unknown = changes[APPLICATION_STATUS_KEY].newValue
    status = isApplicationStatus(value) ? value : undefined
    render()
  })
  const initialVersion = statusVersion
  void chrome.storage.local
    .get(APPLICATION_STATUS_KEY)
    .then((data) => {
      if (statusVersion !== initialVersion) return
      initialReadComplete = true
      const value: unknown = data[APPLICATION_STATUS_KEY]
      status = isApplicationStatus(value) ? value : undefined
      render()
    })
    .catch(() => {
      if (statusVersion !== initialVersion) return
      initialReadComplete = true
      statusReadFailed = true
      render()
    })
  render()

  return {
    render,
    async save(operation: () => Promise<void>): Promise<string | null> {
      const version = ++saveVersion
      saveState = 'saving'
      applyError = null
      render()
      try {
        await operation()
        if (version === saveVersion) {
          saveState = 'waiting'
          render()
        }
      } catch (error) {
        if (version === saveVersion) {
          saveState = 'failed'
          render()
        }
        throw error
      }
      // The reply acknowledges this write even if it made no storage changes.
      // Older background notifications cannot acknowledge a newer queued save.
      let error: string | null
      try {
        error = await apply()
      } catch {
        error = 'Could not confirm rule application. Choose Retry.'
      }
      if (version === saveVersion) {
        applyError = error
        saveState = 'idle'
        render()
      }
      return error
    },
  }
}
