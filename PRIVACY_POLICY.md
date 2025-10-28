# ChHeader Privacy Policy

**Effective Date:** October 28, 2025
**Last Updated:** October 28, 2025

## Overview

ChHeader ("we," "us," "our," or "the Extension") is committed to protecting your privacy. This Privacy Policy explains our practices regarding data collection, use, and disclosure when you use the ChHeader Chrome extension.

**In short: ChHeader does not collect, use, or share any personal data.**

---

## 1. What Data We Collect

### ✅ What We DO Collect

We do not collect any personal data.

The Extension does not:
- Track your browsing activity
- Collect your IP address or location
- Record which websites you visit
- Gather analytics or usage statistics
- Monitor your typing or input
- Create user profiles

### ✅ What Users Store Locally

ChHeader allows users to **voluntarily create and store** the following data **locally on their computer** through Chrome's encrypted storage:

- **Profile names** (e.g., "Development", "Production")
- **Profile colors and notes** (user-provided metadata)
- **URL matchers** (patterns users specify, e.g., "localhost:3000", "*.example.com")
- **Header names and values** (e.g., "Authorization: Bearer token123")
- **Active profile selection** (which profile is currently enabled)
- **User preferences** (if any are added in future versions)

**Important:** Users create and own this data. It is stored exclusively on their computer in Chrome's encrypted local storage database. The Extension does not access, read, or transmit this data anywhere.

---

## 2. How We Use Data

The Extension uses locally-stored user data **only** to:

1. **Display profiles** in the Extension popup
2. **Generate header rules** that are applied to HTTP requests
3. **Apply header modifications** to websites the user explicitly specified
4. **Save user preferences** between browser sessions
5. **Enable profile import/export** functionality

### No Transmission

User-created data is **never**:
- Sent to external servers
- Shared with third parties
- Used for analytics or marketing
- Stored in the cloud
- Accessed by anyone except the user

---

## 3. Data Sharing

**ChHeader does not share user data with any third parties.**

- ❌ No data sent to external servers
- ❌ No third-party analytics services
- ❌ No advertising networks
- ❌ No cloud storage providers
- ❌ No marketing platforms
- ❌ No other extensions or services

The only party that can access user-stored data is the user themselves through:
- The ChHeader Extension interface
- Chrome's local storage (viewable in DevTools)
- JSON export files (user-initiated)

---

## 4. How Your Data is Protected

### Local Storage Security

- Data is stored in Chrome's encrypted `chrome.storage.local` database
- Encryption is handled by Chrome (user's responsibility to secure their computer)
- Data is never transmitted in plain text
- Data remains on the user's device

### Extension Security

- Built with TypeScript strict mode for type safety
- 121 automated tests ensure correct behavior
- No external dependencies that could introduce vulnerabilities
- Uses Chrome's declarativeNetRequest API (sandboxed, secure)
- No content script injection into web pages
- No persistent background network connections

### Browser Security

- Chrome's Manifest V3 is the most restrictive extension architecture
- Sandboxed execution environment
- Automatic updates through Chrome Web Store
- Regular security audits by Chrome team

---

## 5. User Control & Rights

Users have complete control over their data:

### View Data
- See all stored profiles in the Extension popup
- View profile details and header configurations
- Inspect raw storage via Chrome DevTools

### Export Data
- Export profiles as JSON files
- Back up data locally
- Migrate to other systems
- Share profiles with colleagues (if desired)

### Modify Data
- Edit profile names, colors, and notes
- Change URL matchers
- Update header values
- Reorder or reorganize profiles

### Delete Data
- Delete individual profiles
- Clear all profiles at once
- Uninstall the Extension to remove all data
- Data deletion is permanent and immediate

### Revoke Access
- Disable the Extension in Chrome
- Remove the Extension completely
- Revoke optional permissions at any time

---

## 6. Third-Party Services

ChHeader does **not** use any third-party services:

- ❌ Google Analytics or other analytics platforms
- ❌ Crash reporting services (Sentry, Rollbar, etc.)
- ❌ Advertising networks
- ❌ Cloud storage providers (AWS, Azure, Google Cloud, etc.)
- ❌ External APIs or web services
- ❌ Marketing or tracking tools
- ❌ Development tools that transmit data

---

## 7. Data Retention

### Local Data
- User-created profiles are stored indefinitely in Chrome's local storage
- Data persists until the user manually deletes it or uninstalls the Extension
- Users have full control over data retention

### Automatic Deletion
- If Chrome is uninstalled, all Extension data is deleted
- If Chrome profile is removed, all Extension data is deleted
- Disabling the Extension does not delete data

---

## 8. Children's Privacy

ChHeader is not designed for or intended to be used by children under 13. We do not knowingly collect data from children under 13. If we become aware that we have collected data from a child under 13, we will promptly delete it.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify users of material changes by updating the "Last Updated" date at the top of this policy.

Your continued use of ChHeader after any modifications indicates your acceptance of the updated Privacy Policy.

---

## 10. Contact & Questions

For questions about this Privacy Policy or ChHeader's privacy practices:

1. **Review the source code** - ChHeader's code is auditable and transparent
2. **Read the documentation** - See DISTRIBUTION.md and CHROME_WEBSTORE_PRIVACY.md
3. **Check the manifest** - Verify exactly which permissions are used
4. **Review the code** - View the actual implementation on GitHub

---

## 11. Compliance & Standards

ChHeader complies with:

✅ **Chrome Web Store Developer Program Policies**
- No deceptive or hidden functionality
- Transparent permission use
- Single, clear purpose
- User control emphasized

✅ **GDPR** (General Data Protection Regulation)
- No personal data collection or processing
- Users have full data control
- No data sharing with third parties
- Easy data deletion and portability

✅ **CCPA** (California Consumer Privacy Act)
- No personal information collection
- No data sales
- Users can delete data at any time
- Complete transparency

✅ **Chrome Extension Best Practices**
- Manifest V3 (most secure)
- Minimal permissions
- No unnecessary data access
- Respect for user privacy

---

## 12. Summary: What You Need to Know

| Question | Answer |
|----------|--------|
| Does ChHeader collect my data? | ❌ No |
| Does ChHeader track my browsing? | ❌ No |
| Does ChHeader sell my data? | ❌ No (we don't collect it) |
| Where is my data stored? | 📍 Locally on your computer |
| Can I delete my data? | ✅ Yes, anytime |
| Can ChHeader access my data without permission? | ❌ No |
| Does ChHeader use analytics? | ❌ No |
| Does ChHeader use ads? | ❌ No |
| Is my data encrypted? | ✅ Yes (Chrome handles it) |
| Can ChHeader see websites I visit? | ❌ No (only modifies headers you configure) |

---

## 13. Your Privacy Rights

You have the right to:

1. **Access** - View all data ChHeader stores about you
2. **Portability** - Export your data as JSON
3. **Correction** - Edit any stored data
4. **Deletion** - Delete any or all data permanently
5. **Restriction** - Disable the Extension anytime
6. **Objection** - Uninstall the Extension completely
7. **Non-discrimination** - No consequences for exercising privacy rights

---

## Acknowledgment

By using ChHeader, you acknowledge that you have read this Privacy Policy and understand our commitment to your privacy.

---

**ChHeader puts privacy first. Your data is yours alone.**

---

## Legal Notice

This Privacy Policy is provided as-is. While we strive for accuracy and completeness, ChHeader is provided "as-is" without warranties of any kind. For the most authoritative information about ChHeader's privacy practices, review the extension's source code and manifest.

---

**Last Updated:** October 28, 2025
**Version:** 1.0
**Extension Version:** 0.1.0

---

*Questions? Review the CHROME_WEBSTORE_PRIVACY.md and DISTRIBUTION.md files for additional context and technical details.*
