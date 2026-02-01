# Swipe to Recipe Monorepo

## Repo layout

```
apps/
  mobile/    # Expo (Hermes) mobile app
  web/       # Vite web app
packages/
  shared/    # Platform-safe shared utilities
```

## Platform boundaries

- Web-only code must live in `*.web.ts(x)` files.
- Native-only code must live in `*.native.ts(x)` files.
- Shared modules should avoid DOM globals at import time and should import platform-specific files via
  platform extensions (for example, `utils/platform.web.ts`).

## Environment variables

- Web uses `apps/web/.env.local` for `GEMINI_API_KEY` and `VITE_FIREBASE_*`. Copy from
  `apps/web/.env.example`.
- Mobile does not require secrets to boot. Optional bundle identifiers can be provided via
  `MOBILE_IOS_BUNDLE_ID` and `MOBILE_ANDROID_PACKAGE`.

## Scripts (repo root)

- `npm install`
- `npm run web:dev`
- `npm run mobile:start -- --clear`
- `npm run mobile:ios`
- `npm run mobile:android`
- `npm run mobile:doctor`
- `npm run dom:lint`
- `npm run typecheck`
- `npm run deps:react`
