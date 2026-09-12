import type { Profile } from '../../lib/types'
import type { PopupElements } from './popup-elements'
import { profileListItem } from './popup-template'

type ProfileListElements = Pick<PopupElements, 'list' | 'searchResults' | 'noResults'>

export function renderProfileList(
  elements: ProfileListElements,
  profiles: Profile[],
  currentId: string | undefined,
  query: string
): Profile[] {
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? profiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(normalizedQuery) ||
          profile.notes?.toLowerCase().includes(normalizedQuery)
      )
    : profiles

  if (elements.list) {
    elements.list.innerHTML = filtered
      .map((profile) => profileListItem(profile, profile.id === currentId))
      .join('')
  }
  if (elements.searchResults) {
    elements.searchResults.hidden = true
    elements.searchResults.innerHTML = ''
  }
  if (elements.noResults) {
    elements.noResults.classList.remove('hidden')
    elements.noResults.hidden = !normalizedQuery || filtered.length > 0
  }
  return filtered
}
