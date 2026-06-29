# Steps to wire up the firebase fcm push notifications

## Download `google-services.json` from firebase

1. Open your link: https://console.firebase.google.com/project/vibezen-android/settings/cloudmessaging
2. In the left sidebar, click **Project settings** (the gear icon ⚙️ top-left, or "Project settings" under the Cloud Messaging tab).
3. You might be here: https://console.firebase.google.com/project/vibezen-android/settings/general/android:com.frusorganization.vibezen
4. Scroll to the **"Your apps"** section (under the **General** tab).
5. If no Android app is registered yet:
   - Click the Android icon (</>) to add an app.
   - Package name: `com.frusorganization.vibezen` (this matches app.json > expo > android > package).
   - Skip SHA-1 (optional, only needed for Google Sign-In).
   - Click **Register app**.
6. Download the `google-services.json` file when prompted.
7. Place it at `vibezen/google-services.json` and put into .gitignore
8. Put into GOOGLE_SERVICES_JSON Github Action Secret (Plain Text Json)
9. Path needs to be referenced by vibezen/app.json via `expo.googleServicesFile` 


## Download FCM Server credentials (e.g. vibezen-android-d56e89d88077.json)

1. In the Firebase Console → your project → Project settings → Cloud Messaging → Manage service account permissions
2. You might be here: https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=0&project=vibezen-android&hl=en-US
3. + Create Service Account
4. Service account name	Anything descriptive, e.g. expo-fcm-push
   Service account ID	Auto-generated from the name, e.g. expo-fcm-push (accept the default)
   Description	Optional, e.g. Used by Expo Push to send FCM v1 notifications
5. Role / permissions: Firebase Cloud Messaging API Admin (roles/cloudmessaging.admin)
6. After creating it, on the service account row, click ⋯ → Manage keys.
7. Add key → Create new key → JSON → Create.
8. A .json file downloads — this is what you upload to Expo via eas credentials (Android → FCM v1 service account key).

## Upload FCM Server credentials (e.g. vibezen-android-d56e89d88077.json) to expo




## Test Push Notifcations from Expo

Run the App, accept permission, get the ExponentPushToken[...] from the console
Goto https://expo.dev/notifications
Add the Recipient e.g. ExponentPushToken[Gjw_mVJzrQW6feXlLjYEWz]
Titel + Body send
No Access Token or Channel Id required
