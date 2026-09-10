# CHANGELOG

## FinanceApp 1.2.0 Release

**Heads up before upgrading**: authentication and the database were both
replaced, so accounts must be created again and existing data does not carry
over.

Authentication and data:
* Replace Clerk with Supabase Auth — email/password and Google sign-in, with
  email confirmation and a password reset flow
* Move the database from Neon to Supabase Postgres
* Enforce per-user access with row level security in the database rather than
  in application code, so a forgotten filter can no longer expose another
  user's rows
* Verify session JWTs locally instead of calling the auth server on every
  request, removing roughly twelve network round trips per dashboard load

Dates and timezones:
* Store every timestamp as `timestamptz`, making UTC an invariant of the
  database instead of a convention
* Add a display timezone to Settings; transaction lists, charts and the monthly
  calendar now render in the chosen zone rather than the machine's

Market data:
* Upgrade `vnstock-js` to 1.5.1. Gold intraday history and previous-day prices
  are no longer provided upstream, so those columns were removed rather than
  reconstructed from figures that do not mean what the names suggest

Fixes:
* An asset-shaped URL with no file behind it (`/favicon.png`, `/sw.js`) returned
  500 instead of 404
* Uncategorised spending was missing from the category chart
* The API client resolved its base URL at build time, breaking every dashboard
  request whenever the dev server fell back to another port

## FinanceApp 1.1.0 Release

Not documented at the time; recorded here from the history.

* Portfolio, stocks, transactions, analytics and AI insights screens
* Dashboard overview wired to real data: transactions, subscriptions, spending
  breakdown, expense chart and monthly calendar
* Switch the package manager from npm to pnpm

## FinanceApp 1.0.2 Release
Minor release with the following improvements:
* Add Sample Landing Page
* Hotfix Translation

## FinanceApp 1.0.1 Release
Minor release with the following improvements:
* Support language English and Vietnamese
* Support currency USD and VND

## FinanceApp 1.0.0 Release

Initial release with the following features:

* Authentication with Google
* Dashboard with date filter and chart type
* CSV file import transactions
* Transactions, accounts, categories management
