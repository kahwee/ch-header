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
  const api = {
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
