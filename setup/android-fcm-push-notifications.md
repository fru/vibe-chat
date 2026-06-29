# Steps to wire up the Firebase FCM push notifications

> App root for all paths below is the `expo/` subdirectory (i.e. `expo/app.json`,
> `expo/google-services.json`, `expo/.gitignore`). The Expo app is **not** run from
> the repository root.

## 0. Prerequisites

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in to your Expo account: `eas login` (use the `frus-organization` account
   that owns the project).
3. Make sure the project is linked to EAS. [`expo/app.json`](../expo/app.json)
   already contains `extra.eas.projectId` (`46c00ef4-...`), which means
   `eas init` has been run once. If you ever recreate the project, re-run
   `eas init` from the `expo/` directory and commit the new `projectId`.

## 1. Create the Firebase project & register the Android app

> This is the step that is easy to miss — the rest of the guide assumes the
> Firebase project `vibezen-android` already exists with an Android app registered
> under package `com.frusorganization.vibezen`.

1. Go to <https://console.firebase.google.com/> → **Add project**.
2. Name it `vibezen-android` (this is the project id used in every URL below).
3. (Optional) Disable Google Analytics if you don't need it.
4. Once the project is created, open it and in the left sidebar click
   **Project settings** (gear icon ⚙️ top-left).
5. Scroll down to the **"Your apps"** section (under the **General** tab).
6. If no Android app is registered yet:
   - Click the Android icon (`</>`) to add an app.
   - **Package name:** `com.frusorganization.vibezen`
     (must match [`expo/app.json`](../expo/app.json:20) → `expo.android.package`).
   - **App nickname:** anything, e.g. `vibezen`.
   - **SHA-1:** skip (only needed for Google Sign-In).
   - Click **Register app**.
7. **Enable Cloud Messaging (v1).** In the Firebase Console → Project settings →
   **Cloud Messaging**. Firebase now uses the **FCM API (V1)** by default; the
   legacy "Server key" is deprecated and is *not* what Expo needs. Expo consumes
   a service-account JSON (step 3), not the legacy server key.

## 2. Download `google-services.json` from Firebase

1. You should now be here:
   <https://console.firebase.google.com/project/vibezen-android/settings/general/android:com.frusorganization.vibezen>
2. Under the Android app card, click **Download `google-services.json`**.
3. Place the file at **`expo/google-services.json`** (not the repo root).
4. It is already listed in [`expo/.gitignore`](../expo/.gitignore:46) under
   `google-services.json` — verify that line exists so the file is never committed.
5. The path is already referenced by [`expo/app.json`](../expo/app.json:14) via
   `expo.android.googleServicesFile: "./google-services.json"`.
6. For CI builds, store the file contents as the **`GOOGLE_SERVICES_JSON`**
   GitHub Actions secret (plain-text JSON). The workflow
   [`deploy-expo.yml`](../.github/workflows/deploy-expo.yml:37) writes it back to
   `expo/google-services.json` before each EAS build.

## 3. Download FCM Server credentials (e.g. `vibezen-android-*.json`)

This is the service-account key Expo uses to send FCM **v1** notifications.

1. Firebase Console → your project → Project settings → **Cloud Messaging** →
   **Manage service account permissions**.
2. You should land here:
   <https://console.cloud.google.com/iam-admin/serviceaccounts?project=vibezen-android>
3. **+ Create Service Account**
   - **Service account name:** anything descriptive, e.g. `expo-fcm-push`
   - **Service account ID:** auto-generated from the name (accept the default)
   - **Description:** optional, e.g. `Used by Expo Push to send FCM v1 notifications`
4. **Role / permissions:** `Firebase Cloud Messaging API Admin`
   (`roles/cloudmessaging.admin`).
5. After creating it, on the service-account row click **⋯ → Manage keys**.
6. **Add key → Create new key → JSON → Create.**
7. A `.json` file downloads — this is what you upload to Expo in the next step.
8. You do **not** need to keep this file in the repo. If you do keep a copy
   locally, add its pattern to [`expo/.gitignore`](../expo/.gitignore:46), e.g.
   `vibezen-android-*.json` (currently only `google-services.json` and
   `credentials.json` are ignored).

## 4. Upload FCM Server credentials to Expo

1. From the `expo/` directory run: `eas credentials`
2. Select: **Android**
3. Select: **development** (or **production** for release builds)
4. Select: **Google Service Account**
5. Select: **Manage your Google Service Account for Push Notifications (FCM v1)**
6. Select: **Set up a Google Service Account for Push Notifications (FCM v1)**
7. Point it at the JSON file downloaded in step 3.

## 5. Test Push Notifications from Expo

> The `expo-notifications` native module is **not available in Expo Go**
> (see [`NotificationService.ts`](../expo/src/services/NotificationService.ts:7)).
> You must run a **custom development build**:

```bash
# from the expo/ directory
eas build --profile development --platform android
# or, for a local build:
npx expo run:android
```

1. Install the resulting dev build on a device/emulator.
2. Launch the app and **accept the notification permission** prompt.
3. Watch the console for the push token, e.g.:
   `[Notifications] push token: ExponentPushToken[Gjw_mVJzrQW6feXlLjYEWz]`
4. Go to <https://expo.dev/notifications>
5. Set **Recipient** to the `ExponentPushToken[...]` value.
6. Add a **Title** and **Body**, then send.
7. No Access Token or Channel Id is required.

### Note on `EXPO_PROJECT_ID`

[`NotificationService.ts`](../expo/src/services/NotificationService.ts:87) reads
`process.env.EXPO_PROJECT_ID` when calling `getExpoPushTokenAsync`. If you run
the app outside of an EAS build (e.g. `npx expo run:android` locally), export it
first:

```bash
# from the expo/ directory
export EXPO_PROJECT_ID=46c00ef4-a5a6-4120-a015-fb1a11bb25e0
```

Inside an EAS build the value is injected automatically from
[`app.json`](../expo/app.json:52) → `extra.eas.projectId`.
