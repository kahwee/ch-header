export interface PopupElements {
  list: HTMLElement | null
  sidebarSearch: HTMLInputElement | null
  newProfileButton: HTMLButtonElement | null
  detailPane: HTMLElement | null
  detailEmpty: HTMLElement | null
  profileName: HTMLInputElement | null
  profileAvatarButton: HTMLButtonElement | null
  profileAvatarInitials: HTMLElement | null
  profileInitials: HTMLInputElement | null
  profileNotes: HTMLTextAreaElement | null
  profileEnabled: HTMLInputElement | null
  addMatcherButton: HTMLButtonElement | null
  matchers: HTMLElement | null
  addRequestHeaderButton: HTMLButtonElement | null
  requestHeaders: HTMLElement | null
  addResponseHeaderButton: HTMLButtonElement | null
  responseHeaders: HTMLElement | null
  applyButton: HTMLButtonElement | null
  importFile: HTMLInputElement | null
  noResults: HTMLElement | null
  searchResults: HTMLElement | null
}

export function queryPopupElements(root: ParentNode = document): PopupElements {
  const query = <T extends Element>(selector: string): T | null => root.querySelector<T>(selector)

  return {
    list: query('#profileList'),
    sidebarSearch: query('#sidebarSearch'),
    newProfileButton: query('#footerNewProfile'),
    detailPane: query('#detail'),
    detailEmpty: query('#detailEmpty'),
    profileName: query('#profileName'),
    profileAvatarButton: query('#profileAvatarBtn'),
    profileAvatarInitials: query('#profileAvatarInitials'),
    profileInitials: query('#profileInitials'),
    profileNotes: query('#profileNotes'),
    profileEnabled: query('#enabled'),
    addMatcherButton: query('#addMatcher'),
    matchers: query('#matchers'),
    addRequestHeaderButton: query('#addReq'),
    requestHeaders: query('#reqHeaders'),
    addResponseHeaderButton: query('#addRes'),
    responseHeaders: query('#resHeaders'),
    applyButton: query('#apply'),
    importFile: query('#importFile'),
    noResults: query('#noResults'),
    searchResults: query('#searchResults'),
  }
}
