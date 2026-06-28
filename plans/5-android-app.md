# System Architecture & Implementation Blueprint: Hybrid QA & Chat App

## 1. Core Tech Stack & Constraints

* **Frontend:** React Native via **Expo** (Targeting Android/iOS).
* **Dev Workflow:** **Expo Development Builds** and EAS required from Day 1. (Do not use Expo Go due to custom native SDK dependencies).
* **Real-Time Layer:** `@microsoft/signalr` JS client.
* **Push Notifications:** `react-native-wonderpush` (EU GDPR compliant).
* **Navigation:** `@react-navigation/native` with Bottom Tabs and Native Drawer.
* **Content Container:** `react-native-webview` with custom JSON/message bridge for shared authentication state and deep linking.

---

## 2. UI & Navigation Architecture (Web Sidebar to Android Translation)

Convert the desktop 10+ item expandable sidebar into a **Nested Hybrid Navigator Layout**:

```
Root Navigation Tree:
├── DrawerNavigator (Left Swipe / Hamburger Menu)
│    ├── CustomDrawerContent (Houses 10+ secondary QA content menu items using native accordions)
│    └── MainScreen (Points to Bottom Tab Navigator)
│
└── BottomTabNavigator (Persistent primary navigation, max 3-4 tabs)
     ├── Tab 1: Home / Dashboard (Launches WebView content)
     ├── Tab 2: Messages (Primary Native Chat UI for SignalR)
     └── Tab 3: Notifications / Profile

```

### UX Implementation Rules:

* Use Android Material Design ripple effects (`TouchableNativeFeedback` / `Pressable`).
* Handle hardware back button logic: If the Drawer is open, Back closes it. If in the Messages Tab, Back routes to the Home Tab.
* Expandable menu items inside the Drawer must use smooth accordion animations (`react-native-paper` `<List.Accordion>` or `react-native-reanimated`).

---

## 3. Hybrid Real-Time & Push Notification Architecture

Implement a dual-layer messaging strategy: **SignalR for Foreground** + **WonderPush for Background**.

### Client-Side Connection Lifecycle:

* Listen to React Native’s `AppState` API.
* **When `AppState === 'active'**`: Establish/restore the SignalR hub connection.
* **When `AppState === 'background'**`: Gracefully invoke hub closure to prevent "ghost sockets" and clear local resources.

### Backend Routing Logic (Two-Tiered Acknowledgment Pattern):

When a chat message is sent to a specific `UserId`, query a distributed cache (e.g., Redis) tracking `UserId -> ConnectionId[]`:

1. **Tier 1 (Fast Path):** If active connections == `0`, immediately fire a **WonderPush** notification payload. Bypass all timers.
2. **Tier 2 (Ghost Path):** If active connections > `0`, stream the message over the active SignalR connection and start a backend timer (5–10 seconds).
3. **The Handshake:** Upon receipt of the message, the mobile client must immediately send an invocation back to the server: `Hub.InvokeAsync("AckMessage", messageId)`.
4. **The Fallback:** If the backend timer expires before the server receives the `AckMessage` for that specific ID, assume a zombie mobile connection and trigger the **WonderPush** notification.

### Data Deduplication Rule:

To prevent race conditions where a message arrives at the last second alongside a timeout notification, the mobile client must intercept incoming push notifications and check local state: `if (incomingPush.messageId === localChatState.exists) { suppressNotificationBanner(); }`.

---

## 4. WebView Boundary & Auth Strategy

* **Native Login (updated):** Login/logout happens **natively in the app** (not inside the WebView). The app owns a `LoginScreen` and an `AuthService` backed by `expo-secure-store`. The WebView never hosts the login flow.
* **Credential Hand-off:** The authenticated JWT + user id are handed to the WebView so the web session shares identical credentials:
  * The token is injected as `window.__VIBEZEN_TOKEN__` before the page loads and stamped onto every `fetch`/`XMLHttpRequest` via an `Authorization: Bearer` header.
  * The user id is appended to the URL (`?user=`) so the Angular `UserService` picks it up from the query param.
  * The same token is sent on the SignalR hub connection (`accessTokenFactory`) and on every REST call from the native chat client.
* **The Bridge:** Configure a bidirectional message handler using `window.ReactNativeWebView.postMessage` so actions taken within the WebView can trigger native `@react-navigation` events (e.g., clicking a user profile inside the web dashboard opens the native Chat screen). A login/logout bridge is **not** needed.