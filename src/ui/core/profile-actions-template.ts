export function profileActionsTemplate(): string {
  return `
  <div id="profileContextMenu" class="profile-context-menu" role="menu" aria-label="Profile actions" hidden>
    <div class="context-menu__name" data-context-name></div>
    <button type="button" role="menuitem" data-profile-action="toggle">Turn on</button>
    <button type="button" role="menuitem" data-profile-action="rename">Rename</button>
    <button type="button" role="menuitem" data-profile-action="duplicate">Duplicate</button>
    <div role="separator"></div>
    <button type="button" role="menuitem" data-profile-action="copy">Copy JSON</button>
    <button type="button" role="menuitem" data-profile-action="export">Export JSON…</button>
    <div role="separator"></div>
    <button type="button" role="menuitem" data-profile-action="delete" class="menu-item--danger">Delete</button>
  </div>
  <div id="profileNotice" class="profile-notice" role="status" hidden><span></span><button type="button" id="undoDelete" hidden>Undo</button><button type="button" id="dismissNotice" aria-label="Dismiss notification">×</button></div>
  <dialog id="sharingDialog" class="sharing-dialog" aria-labelledby="sharingTitle" aria-describedby="sharingHelp">
    <div class="sharing-dialog__heading"><h2 id="sharingTitle">Export profiles</h2><button type="button" id="sharingClose" class="icon-button" aria-label="Close sharing dialog">×</button></div>
    <p id="sharingHelp"></p>
    <div id="sharingExportSettings" class="sharing-settings">
      <label>Export <select id="sharingScope" class="field"><option value="selected">This profile</option><option value="all">All profiles</option></select></label>
      <label id="sharingSensitive"><input type="checkbox" id="sharingRedact" checked> Hide sensitive header values</label>
    </div>
    <textarea id="sharingJSON" spellcheck="false" class="field sharing-json" aria-label="JSON to export" placeholder='Paste a profile or a ChHeader export here…'></textarea>
    <p id="sharingFeedback" role="status"></p>
    <p id="sharingError" role="alert" class="sharing-error"></p>
    <div class="sharing-dialog__footer">
      <input type="file" id="sharingFile" accept=".json,application/json" hidden>
      <button type="button" id="sharingChooseFile" class="button button--secondary button--md">Choose file…</button>
      <button type="button" id="sharingDownload" class="button button--secondary button--md">Download .json</button>
      <button type="button" id="sharingCopy" class="button button--primary button--md">Copy JSON</button>
      <button type="button" id="sharingImport" class="button button--primary button--md">Import profiles</button>
    </div>
  </dialog>`
}
