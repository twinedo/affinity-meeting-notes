# Affinity Meeting Notes

Affinity Meeting Notes is an Expo Router mobile app backed by FastAPI and Supabase. It records in-person meetings, uploads audio to Supabase Storage, processes the recording through a lightweight backend, stores transcript and summary results in Postgres, and sends an Expo push notification that deep-links back to the finished meeting.

## Stack

- Expo SDK 54
- Expo Router
- TypeScript
- Zustand
- Expo Audio
- Expo Notifications
- Python FastAPI
- Supabase Postgres + Storage
- OpenAI Whisper-1 / chat completion fallback-ready backend processing

## Project Structure

```text
app/
  (tabs)/
    _layout.tsx
    index.tsx
    meetings.tsx
  meeting/
    [id].tsx
  _layout.tsx
backend/
  main.py
  requirements.txt
  schema.sql
  step5.sql
  services/
hooks/
plugins/
stores/
types/
utils/
README.md
```

## Project Overview

The current submission supports the full core flow:

1. Record audio from the Home screen.
2. Upload audio to Supabase Storage.
3. Insert a meeting row in Supabase.
4. Call the FastAPI `/process-meeting` endpoint.
5. Transcribe audio and generate a summary.
6. Update the meeting row to `completed` or `failed`.
7. Send an Expo push notification.
8. Deep-link the user to `/meeting/[id]` when the notification is tapped.

## Environment Variables

Root `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_BACKEND_URL`
- `EXPO_PUBLIC_EAS_PROJECT_ID`

Backend `backend/.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` optional
- `OPENAI_TRANSCRIPTION_MODEL` optional
- `OPENAI_SUMMARY_MODEL` optional
- `USE_MOCK_TRANSCRIPTION` optional
- `USE_MOCK_SUMMARY` optional

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and publishable key into the root `.env`.
3. Open the Supabase SQL editor and run [backend/schema.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/schema.sql).
4. If your database was initialized before the `failed` status was added, run [backend/step5.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/step5.sql) once.

This creates:

- the `meetings` table
- an `updated_at` trigger
- anonymous-auth-ready RLS policies
- the `meeting-audio` storage bucket
- user-scoped storage policies

5. In Supabase Auth providers, enable `Anonymous Sign-Ins`.
6. If your database was initialized before anonymous auth + user-scoped RLS were added, run [backend/step6.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/step6.sql).

Notes:

- The app silently creates an anonymous Supabase user on launch. There is no visible login form.
- Existing meeting rows created before the auth migration may not be visible to new anonymous sessions unless you manually associate them with a user.

## Mobile App Setup

1. Create the root env file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure Android push if you want end-to-end notification testing:

   - place `google-services.json` at the repo root
   - upload the Firebase FCM V1 service account key to Expo credentials
   - set `EXPO_PUBLIC_EAS_PROJECT_ID`

4. Rebuild native code when notification or native config changes:

   iOS:

   ```bash
   npx expo prebuild --clean
   cd ios
   pod install
   cd ..
   bun run ios
   ```

   Android:

   ```bash
   npx expo prebuild --clean
   bun run android
   ```

5. Start Metro:

   ```bash
   bun run start
   ```

Notes:

- Android Expo push notifications were verified on a physical device.
- iOS push notification code is in place, but Apple credential setup was not completed in this workspace because the available Apple Developer teams were not owned by the submitter.
- Remote push notifications do not work on iOS Simulators or Android Emulators.

## Backend Setup

1. Create the backend env file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Create and activate a virtual environment:

   ```bash
   python3 -m venv backend/.venv
   source backend/.venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

4. Run the API:

   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

Notes:

- Use your machine LAN IP for `EXPO_PUBLIC_BACKEND_URL` when testing on a real device.
- If `OPENAI_API_KEY` is omitted, the backend can still run with mock transcription and summary settings.

## Architecture Decisions

- Expo Router stayed as the required navigation layer.
- Zustand stores keep screen components thin and keep asynchronous meeting state in one place.
- Supabase access is separated into utility/repository modules instead of being embedded in screen code.
- FastAPI processing remains synchronous and simple for reviewer clarity; no job queue or worker system was added.
- Expo push notification handling is split between app registration/response handling and backend delivery, which keeps deep linking straightforward.

## Reviewer Notes

- The primary verified path is Android physical-device testing with Supabase, backend processing, Expo push notifications, and deep linking.
- Push notification delivery failures do not block meeting completion.
- Playback UI is present but intentionally not implemented as a finished feature.
- The repo intentionally avoids auth complexity for this take-home stage.

## What I Would Improve With More Time

- add remote/local playback for processed meetings
- move backend processing into a queue/worker model
- add authenticated Supabase policies instead of broad anon access
- add retry and receipt tracking for push notifications
- persist device push tokens per user/session instead of in-memory app state
- improve iOS push setup documentation once Apple credentials are available
