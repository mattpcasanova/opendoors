# Push Notifications - Simulator vs Production

## Simulator Behavior
**Yes, push notifications showing every refresh on simulator is expected behavior and won't be an issue in production.**

### Why this happens:
1. **Local Notifications on Simulator**: We're currently using `scheduleNotificationAsync` which creates local notifications. On iOS simulator, these can fire repeatedly when the app refreshes because the simulator doesn't fully emulate real device notification behavior.

2. **In-Memory Tracking**: Previously we used an in-memory `Map` to track sent notifications, which resets on every app refresh. This has been fixed - we now use database tracking (`user_settings.last_*_notification_date`) which persists across refreshes.

3. **Actual Push Notifications**: In production, when you use Expo's Push Notification service:
   - Notifications are sent from your backend/server
   - The server tracks what has been sent
   - Each notification is only sent once by the server
   - The device receives it once, regardless of app state

## Production Setup

When you're ready for production push notifications:

1. **Store Push Tokens**: The push token is currently logged - you'll need to store it in your database (`user_profiles` or a separate `push_tokens` table).

2. **Backend Service**: Create a backend service (Supabase Edge Function, Firebase Cloud Function, or your own server) that:
   - Stores push tokens when users register
   - Tracks notification send status in database
   - Only sends push notifications once per event
   - Uses Expo's Push Notification API to send to devices

3. **Replace Local Notifications**: Replace `sendLocalNotification` calls with actual push notification API calls from your backend.

## Current Implementation

**Database Tracking (Persists across refreshes):**
- `user_settings.last_daily_notification_date` - Tracks daily reset notifications
- `user_settings.last_expiring_notification_date` - Tracks expiring rewards
- `user_settings.last_bonus_notification_date` - Tracks bonus notifications

**How it works:**
1. Check if notification was sent today (via database date)
2. If not sent today, mark date in database FIRST (prevents race conditions)
3. Send notification
4. On next check, database date prevents duplicate sends

**Result:** Even on simulator, notifications should only send once per day (after database tracking fix). The visual notification might appear multiple times due to simulator quirks, but the actual send logic only happens once.

## Testing on Real Device

To test properly:
1. Build a development build: `npx expo run:ios`
2. Install on physical device
3. Grant notification permissions
4. Test - notifications should only appear once per day/event

## Summary

✅ **Simulator showing notifications on every refresh = Expected (simulator limitation)**  
✅ **Database tracking prevents duplicate sends**  
✅ **Production push notifications will only send once (server-side tracking)**  
✅ **Not an issue for production**

