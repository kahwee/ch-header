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
  if (elements.list) {
    elements.list.innerHTML = profiles
      .map((profile) => profileListItem(profile, profile.id === currentId))
      .join('')
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? profiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(normalizedQuery) ||
          profile.notes?.toLowerCase().includes(normalizedQuery)
      )
    : profiles

  if (elements.searchResults) {
    elements.searchResults.hidden = !normalizedQuery
    elements.searchResults.innerHTML = normalizedQuery
      ? `<h2 class="search-results__title">Search results</h2>
         <ul class="search-results__list" role="list">
           ${filtered.map((profile) => profileListItem(profile, profile.id === currentId)).join('')}
         </ul>`
      : ''
  }

  if (elements.noResults) elements.noResults.hidden = !normalizedQuery || filtered.length > 0
  return filtered
}
