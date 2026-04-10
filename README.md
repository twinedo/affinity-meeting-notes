# Affinity Meeting Notes

Minimal Expo SDK 54 baseline for the Affinity Labs take-home task.

## Included

- Expo Router setup
- Required route skeleton
- Custom config plugin support under `plugins/`
- Supabase client setup for meeting upload and read flows
- SQL setup file under `backend/`
- FastAPI `/process-meeting` backend flow under `backend/`
- Expo push notification registration and meeting deep linking

## Not Included Yet

- Auth flows

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
plugins/
backend/
  main.py
  requirements.txt
  schema.sql
  step5.sql
  services/
README.md
```

## Local Setup

1. Copy the example env file and fill in your Supabase values:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `EXPO_PUBLIC_BACKEND_URL`

2. Create the Supabase table, policies, bucket, and seed rows:

   - Open the Supabase SQL editor.
   - Run [`backend/schema.sql`](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/schema.sql).
   - If you already completed step 4 before adding the backend, also run [`backend/step5.sql`](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/step5.sql) once so the `failed` status is allowed.

3. Set up the backend environment:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Required backend variables:

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

   Optional backend variables:

   - `OPENAI_API_KEY`
   - `OPENAI_TRANSCRIPTION_MODEL`
   - `OPENAI_SUMMARY_MODEL`
   - `USE_MOCK_TRANSCRIPTION`
   - `USE_MOCK_SUMMARY`

4. Install app dependencies:

   ```bash
   bun install
   ```

5. Configure Expo push notifications:

   - Set `EXPO_PUBLIC_EAS_PROJECT_ID` in the root `.env`.
   - For Android, place Firebase's `google-services.json` at the repo root as [`google-services.json`](/Users/twinedo/Documents/affinity/affinity-meeting-notes/google-services.json).
   - For Android, upload your Firebase FCM V1 service account key to the Expo project credentials.
   - Build and run the app on a physical device. Expo remote push notifications do not work on iOS Simulators or Android Emulators.
   - The app requests notification permission on launch and registers the Expo push token automatically.

6. Set up and run the backend:

   ```bash
   python3 -m venv backend/.venv
   source backend/.venv/bin/activate
   pip install -r backend/requirements.txt
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. Start the Expo app:

   ```bash
   bun run start
   ```

8. Open on a physical iOS or Android device from the Expo CLI.

## How Step 6 Works

- When a recording stops, the app uploads the local audio file to the `meeting-audio` Supabase Storage bucket.
- After upload succeeds, it inserts a row into the `meetings` table with status `uploaded`.
- The Expo app then calls `POST /process-meeting` on the FastAPI backend with `audio_url`, `meeting_id`, and `push_token`.
- The backend marks the meeting as `processing`, downloads the audio, transcribes it, generates a summary, and updates the Supabase row to `completed` or `failed`.
- After a successful update, the backend sends an Expo push notification with:
  - `meetingId`
  - `route`
  - `url`
- The Home, Meetings, and Meeting Detail screens read from Supabase through the shared Zustand store.
- Tapping the notification routes to `/meeting/[id]` through Expo Router.

## Notes

This scaffold stays intentionally small so the required architecture can be layered in later without reworking the routing setup.

A custom Expo config plugin is used for native background-audio configuration because the take-home requires background recording support on iOS and Android, and those native settings must be applied during prebuild.

Supabase is intentionally configured without auth for this stage so the storage upload and table writes stay easy to review. That keeps the step small, but it is not production security posture.
