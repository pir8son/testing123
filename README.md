# Swipe to Recipe (Monorepo)

This repository now contains separate apps for web and mobile, with a shared workspace for cross-platform utilities.

## Structure

```
/apps
  /mobile   # Expo managed app (iOS/Android, Hermes)
  /web      # Existing Vite web app
/packages
  /shared   # Shared utilities/types for native/web
```

## Prerequisites

- Node.js
- For iOS/Android: Xcode/Android Studio (or Expo Go/dev client)

## Web app

```bash
npm install
npm run web:dev
```

## Mobile app (Expo)

```bash
npm install
npm run mobile:start
```

Run platform builds:

```bash
npm run mobile:ios
npm run mobile:android
```

## DOM safety check

```bash
npm run dom:lint
```

This command scans the native/shared workspaces to ensure no DOM globals are referenced outside the web app.
