import { vi } from 'vitest'
import type { ExtensionStorage } from '../lib/types'

function event<Args extends unknown[]>() {
  const listeners = new Set<(...args: Args) => unknown>()
  return {
    addListener: (listener: (...args: Args) => unknown) => listeners.add(listener),
    removeListener: (listener: (...args: Args) => unknown) => listeners.delete(listener),
    emit: (...args: Args) => [...listeners].map((listener) => listener(...args)),
  }
}

/** In-memory API boundary, not a Chrome rule validator or a network simulator. */
export function createChromeHarness(initial: Partial<ExtensionStorage> = {}) {
  const data: Record<string, unknown> = structuredClone(initial)
  let rules: chrome.declarativeNetRequest.Rule[] = []
  const onChanged = event<[Record<string, chrome.storage.StorageChange>, string]>()
  const onInstalled = event<[]>()
  const onMessage = event<[unknown, object, (response: unknown) => void]>()
  let origins = [
    'http://127.0.0.1/*',
    'https://127.0.0.1/*',
    'http://localhost/*',
    'https://localhost/*',
  ]
  const onRemoved = event<[chrome.permissions.Permissions]>()
  const api = {
    permissions: {
      onRemoved,
      onAdded: event<[chrome.permissions.Permissions]>(),
      contains: vi.fn(
        (requested: chrome.permissions.Permissions, callback: (granted: boolean) => void) =>
          callback((requested.origins ?? []).every((origin) => origins.includes(origin)))
      ),
      request: vi.fn(
        (requested: chrome.permissions.Permissions, callback: (granted: boolean) => void) => {
          origins = [...new Set([...origins, ...(requested.origins ?? [])])]
          callback(true)
        }
      ),
      getAll: vi.fn((callback: (value: chrome.permissions.Permissions) => void) =>
        callback({ origins: [...origins] })
      ),
      remove: vi.fn(
        (requested: chrome.permissions.Permissions, callback: (removed: boolean) => void) => {
          origins = origins.filter((origin) => !requested.origins?.includes(origin))
          onRemoved.emit(requested)
          callback(true)
        }
      ),
    },
    storage: {
      onChanged,
      local: {
        get: vi.fn(async (keys: string | string[]) =>
          structuredClone(Object.fromEntries([keys].flat().map((key) => [key, data[key]])))
        ),
        set: vi.fn(async (values: Record<string, unknown>, callback?: () => void) => {
          const changes = Object.fromEntries(
            Object.entries(values)
              .filter(([key, value]) => JSON.stringify(data[key]) !== JSON.stringify(value))
              .map(([key, value]) => [key, { oldValue: data[key], newValue: value }])
          )
          Object.assign(data, structuredClone(values))
          if (Object.keys(changes).length) onChanged.emit(structuredClone(changes), 'local')
          callback?.()
        }),
      },
    },
    runtime: {
      onInstalled,
      onStartup: event<[]>(),
      onMessage,
      sendMessage: vi.fn(
        (message: unknown) =>
          new Promise<unknown>((resolve, reject) => {
            const results = onMessage.emit(message, {}, resolve)
            if (!results.includes(true)) reject(new Error('No asynchronous message handler'))
          })
      ),
    },
    declarativeNetRequest: {
      isRegexSupported: vi.fn(async (_options: chrome.declarativeNetRequest.RegexOptions) => ({
        isSupported: true,
      })),
      getDynamicRules: vi.fn(async () => structuredClone(rules)),
      updateDynamicRules: vi.fn(async (update: chrome.declarativeNetRequest.UpdateRuleOptions) => {
        rules = structuredClone([
          ...rules.filter((rule) => !update.removeRuleIds?.includes(rule.id)),
          ...(update.addRules ?? []),
        ])
      }),
    },
  }
  return {
    api,
    snapshot: () => structuredClone(data),
    rules: () => structuredClone(rules),
    // Apply is queued after prior storage events by the real background module.
    settle: () => api.runtime.sendMessage({ type: 'applyNow' }),
  }
}
