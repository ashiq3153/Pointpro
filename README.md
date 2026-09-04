# PointPro

Telegram Mini App frontend for the PointPro project.

## Included
- Home dashboard
- Free plan
- Paid package list: ৳100, ৳500, ৳1,000, ৳2,000, ৳5,000, ৳10,000, ৳50,000, ৳100,000
- 30-day calculation view
- Per-minute calculation display
- Referral page and share/copy controls
- Wallet and profile UI
- Telegram Mini App user verification endpoint
- Mobile-first bottom navigation

## Telegram setup
In Vercel Project Settings → Environment Variables, add:

**Name:** BOT_TOKEN  
**Value:** your Telegram bot token

Apply it to Production (and Preview/Development only if you need them). Then redeploy.

**Never put BOT_TOKEN inside index.html or commit it to GitHub.**

## Backend note
The current package/return figures are frontend calculation/display values. Do not enable real-money deposits, withdrawals, guaranteed returns, or referral payouts until the server-side ledger, payment verification, fraud controls, accounting and applicable legal/compliance requirements are implemented and reviewed.
