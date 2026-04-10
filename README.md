# Affinity Meeting Notes

Minimal Expo SDK 54 baseline for the Affinity Labs take-home task.

## Included

- Expo Router setup
- Required route skeleton
- Custom config plugin support under `plugins/`
- Supabase client setup for meeting upload and read flows
- SQL setup file under `backend/`

## Not Included Yet

- FastAPI processing pipeline
- Push notifications
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
  schema.sql
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

2. Create the Supabase table, policies, bucket, and seed rows:

   - Open the Supabase SQL editor.
   - Run [`backend/schema.sql`](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/schema.sql).

3. Install dependencies:

   ```bash
   bun install
   ```

4. Start the Expo app:

   ```bash
   bun run start
   ```

5. Open on iOS, Android, or web from the Expo CLI.

## How Step 4 Works

- When a recording stops, the app uploads the local audio file to the `meeting-audio` Supabase Storage bucket.
- After upload succeeds, it inserts a row into the `meetings` table with status `uploaded`.
- The Home, Meetings, and Meeting Detail screens read from Supabase through the shared Zustand store.

## Notes

This scaffold stays intentionally small so the required architecture can be layered in later without reworking the routing setup.

A custom Expo config plugin is used for native background-audio configuration because the take-home requires background recording support on iOS and Android, and those native settings must be applied during prebuild.

Supabase is intentionally configured without auth for this stage so the storage upload and table writes stay easy to review. That keeps the step small, but it is not production security posture.
