import { afterEach, describe, expect, it, vi } from 'vitest'
import { APPLICATION_STATUS_KEY, type ApplicationStatus } from '../../../lib/application-status'
import type { State } from '../../../lib/types'
import { createChromeHarness } from '../../../test/chrome-harness'
import { localProfile } from '../../../test/popup-harness'
import { setupApplicationStatus } from '../popup-application-status'
import { getPopupTemplate } from '../popup-template'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const applied: ApplicationStatus = {
  state: 'applied',
  profileId: 'local',
  profileName: 'Local demo',
  ruleCount: 1,
  updatedAt: 1,
}

function setup(apply = vi.fn<() => Promise<string | null>>().mockResolvedValue(null)) {
  const chrome = createChromeHarness()
  const initial = deferred<Record<string, unknown>>()
  chrome.api.storage.local.get.mockReturnValueOnce(initial.promise)
  vi.stubGlobal('chrome', chrome.api)
  document.body.innerHTML = getPopupTemplate()
  const profile = localProfile({ enabled: true })
  const state: State = {
    profiles: [profile],
    current: profile,
    activeId: profile.id,
    filtered: [profile],
  }
  const status = setupApplicationStatus(document, state, apply)
  const element = document.querySelector<HTMLElement>('#applicationStatus')!
  const publish = (value: unknown) =>
    chrome.api.storage.onChanged.emit({ [APPLICATION_STATUS_KEY]: { newValue: value } }, 'local')
  return { status, element, initial, publish, apply, state }
}

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('application status ordering', () => {
  it('does not let an older apply reply or background notification acknowledge a newer pending save', async () => {
    const olderApply = deferred<string | null>()
    const newerApply = deferred<string | null>()
    const apply = vi
      .fn<() => Promise<string | null>>()
      .mockReturnValueOnce(olderApply.promise)
      .mockReturnValueOnce(newerApply.promise)
    const h = setup(apply)
    h.initial.resolve({ [APPLICATION_STATUS_KEY]: applied })
    await h.initial.promise
    const older = h.status.save(async () => {})
    await Promise.resolve()
    const write = deferred<void>()
    const newer = h.status.save(() => write.promise)
    h.publish(applied)
    olderApply.resolve('Older application failed')
    await older
    expect(h.element.textContent).toBe('Saving changes…')
    write.resolve()
    await write.promise
    expect(h.element.textContent).toBe('Saved · Waiting for Chrome…')
    h.publish({ ...applied, ruleCount: 2 })
    expect(h.element.textContent).toBe('Saved · Waiting for Chrome…')
    newerApply.resolve(null)
    await newer
    expect(h.element.textContent).toContain('Applied · 2 URL rules')
  })

  it('does not replace a newer successful save with an older write failure', async () => {
    const h = setup()
    h.initial.resolve({ [APPLICATION_STATUS_KEY]: applied })
    await h.initial.promise
    const write = deferred<void>()
    const older = h.status.save(() => write.promise)
    const expectedRejection = expect(older).rejects.toThrow('Older write failed')
    await h.status.save(async () => {})
    write.reject(new Error('Older write failed'))
    await expectedRejection
    expect(h.element.textContent).toContain('Applied · 1 URL rule')
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores a late initial read %s after fresh runtime status',
    async (outcome) => {
      const h = setup()
      h.publish(applied)
      if (outcome === 'resolve')
        h.initial.resolve({ [APPLICATION_STATUS_KEY]: { ...applied, ruleCount: 99 } })
      else h.initial.reject(new Error('Read failed'))
      await h.initial.promise.catch(() => {})
      await Promise.resolve()
      expect(h.element.textContent).toContain('Applied · 1 URL rule')
      expect(h.element.dataset.state).toBe('applied')
    }
  )

  it.each([undefined, { state: 'applied' }, { ...applied, ruleCount: -1 }])(
    'offers a check when initial status is absent or malformed',
    async (value) => {
      const h = setup()
      h.initial.resolve({ [APPLICATION_STATUS_KEY]: value })
      await h.initial.promise
      expect(h.element.textContent).toBe('Status not confirmed. Press Apply to check.')
      expect(h.element.getAttribute('role')).toBe('status')
      expect(h.element.getAttribute('aria-live')).toBe('polite')
    }
  )

  it('keeps initial read failures visible through renders until fresh status arrives', async () => {
    const h = setup()
    h.initial.reject(new Error('Read failed'))
    await h.initial.promise.catch(() => {})
    await Promise.resolve()
    h.status.render()
    expect(h.element.textContent).toContain('Could not read application status')
    expect(h.element.dataset.state).toBe('error')
    h.publish(applied)
    expect(h.element.textContent).toContain('Applied ·')
  })

  it('shows a persisted global failure after rules were cleared', async () => {
    const h = setup()
    h.state.profiles[0].enabled = false
    const failure: ApplicationStatus = {
      state: 'error',
      profileId: null,
      profileName: null,
      ruleCount: 0,
      rulesMayBeActive: false,
      message: 'Previous rules cleared. Check URL rules and headers before turning on a profile.',
      updatedAt: 2,
    }
    h.initial.resolve({ [APPLICATION_STATUS_KEY]: failure })
    await h.initial.promise
    h.status.render()
    expect(h.element.textContent).toBe(failure.message)
    expect(h.element.dataset.state).toBe('error')
    h.publish(applied)
    expect(h.element.textContent).toContain('Applied ·')
  })

  it('shows an unconfirmed application after a rejected apply callback without claiming the save failed', async () => {
    const h = setup(
      vi.fn<() => Promise<string | null>>().mockRejectedValue(new Error('Private raw error'))
    )
    h.initial.resolve({ [APPLICATION_STATUS_KEY]: applied })
    await h.initial.promise
    const error = await h.status.save(async () => {})
    expect(error).toBe('Could not confirm rule application. Press Apply to retry.')
    expect(h.element.textContent).toBe(error)
    expect(h.element.dataset.state).toBe('error')
  })
})
