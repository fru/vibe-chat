# VibeZen Android (Expo / React Native)

Native Android app for the VibeZen QA & Chat platform, implementing
[`plans/5-android-app.md`](../plans/5-android-app.md).

## Stack

- **React Native via Expo** — custom Development Builds (not Expo Go, due to
  native SDK dependencies).
- **Real-time:** `@microsoft/signalr` JS client.
- **Push:** `react-native-wonderpush` (EU GDPR compliant).
- **Navigation:** `@react-navigation/native` with Drawer + Bottom Tabs.
- **Content:** `react-native-webview` with a JSON message bridge.
- **UI:** `react-native-paper` (Material Design, accordions, ripple effects).
- **Auth:** native login backed by `expo-secure-store`.

## Architecture

```
src/
├── App.tsx                      # Root: auth gate + bootstrap
├── RootDrawerNavigator.tsx      # Drawer + screens
├── components/
│   └── CustomDrawerContent.tsx  # Accordion menu (mirrors web sidebar)
├── config/
│   └── env.ts                   # Runtime config from app.config.ts extra
├── hooks/
│   └── useRoomCount.ts          # Live unread count subscription
├── navigation/
│   ├── types.ts                 # Param lists
│   └── useAndroidBackHandler.ts # Hardware back-button logic
├── screens/
│   ├── LoginScreen.tsx          # Native login
│   ├── HomeScreen.tsx           # WebView + credential injection + bridge
│   ├── MessagesScreen.tsx       # Native chat UI
│   ├── NotificationsScreen.tsx  # Unread summary + profile + logout
│   ├── RoomsScreen.tsx
│   └── WorkflowScreen.tsx
├── services/
│   ├── AuthService.ts           # Native login, secure token storage
│   ├── ChatApi.ts               # REST client (mirrors web chat.ts)
│   ├── SignalRService.ts        # Hub + AppState lifecycle
│   ├── UserStore.ts             # Persisted user id
│   └── WonderPushService.ts     # Push + dedup
└── types/
    └── chat.ts                  # Shared DTOs
```

### Auth & WebView credential hand-off

Login/logout is **native**. The authenticated JWT + user id are handed to the
WebView so the web session shares identical credentials:

- Token injected as `window.__VIBEZEN_TOKEN__` and stamped onto every
  `fetch`/`XMLHttpRequest` as `Authorization: Bearer`.
- User id appended to the URL (`?user=`) for the Angular `UserService`.
- Same token sent on the SignalR hub (`accessTokenFactory`) and REST calls.

### Real-time lifecycle

- `AppState === 'active'` → establish/restore the SignalR hub.
- `AppState === 'background'` → gracefully stop the hub (prevents ghost sockets;
  backend falls back to WonderPush).
- Hub pushes `MessageCounts` (`Record<roomName, count>`); the UI re-GETs
  messages when the count for the viewed room changes.

### Push dedup

If a WonderPush notification arrives for a `messageId` already seen via
SignalR, the banner is suppressed (see `WonderPushService.markMessageSeen`).

## Prerequisites

- Node 18+ and the Expo CLI: `npm install -g eas-cli`
- An Android device or emulator.
- Place image assets in `assets/` (see `assets/README.md`).
- Real WonderPush credentials (set as env vars for EAS builds).

## Setup

```bash
cd android
npm install
```

## Run (development build)

A custom development build is required (not Expo Go):

```bash
# Create and install a development build on a connected device/emulator
eas build --profile development --platform android
# or run locally:
npx expo run:android
```

Then start the JS bundler:

```bash
npm start
```

### Local backend URLs

The dev profile points at `http://10.0.2.2:5000` (backend) and
`http://10.0.2.2:4200` (Angular web app) — the Android emulator's alias for the
host machine's `localhost`. Override via `VIBEZEN_API_URL` / `VIBEZEN_WEB_URL`
in `eas.json` or `app.config.ts`.

## Build profiles

| Profile      | Distribution | Use                         |
| ------------ | ------------- | --------------------------- |
| development  | internal      | Dev client on your device   |
| preview      | internal      | Internal QA build           |
| production   | store         | Play Store submission       |

```bash
eas build --profile production --platform android
```

## Backend contract

The app consumes the existing .NET backend:

- `GET  /api/rooms/{room}/messages`
- `POST /api/rooms/{room}/messages`
- `POST /api/rooms/{room}/read`
- SignalR hub at `/api/chathub?userId=...` emitting `MessageCounts`.

> **Note:** `AuthService.login` posts to `/api/auth/login`, which the backend
> does not yet implement. Wire the real endpoint/shape once backend auth lands.
