ARVEN TRACKER — Safari PWA

Local-first personal finance tracker.

Features in this package:
- Dashboard, transactions, monthly budgets
- Indonesian / English interface selection
- Dark / light appearance toggle
- Local chat assistant for transaction entry (rule-based parsing, no cloud AI/API)
- Local IndexedDB storage
- JSON backup and restore
- 6-digit local PIN access gate
- Service Worker offline app-shell cache

Deploy: publish all files in the repository root using GitHub Pages (main / root).
Open the HTTPS URL in Safari and use Share > Add to Home Screen.

Chat assistant examples:
- Hari ini membeli makan 50.000
- Gaji masuk 6 juta
- Bought lunch today 50,000
- Salary received 6 million

Important:
- Chat parsing is local and rule-based, not a general AI assistant. It may not understand every phrasing. Review each transaction summary in the chat.
- Transaction and budget data remain in this browser's IndexedDB. Back up before major updates, clearing browser data, or changing devices.
- The PIN is an access gate, not database encryption or server authentication.
- Do not put financial records or backup files in the public GitHub repository.
