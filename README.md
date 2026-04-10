# Affinity Meeting Notes

Minimal Expo SDK 54 baseline for the Affinity Labs take-home task.

## Included

- Expo Router setup
- Required route skeleton
- Custom config plugin support under `plugins/`
- Empty `backend/` folder

## Not Included Yet

- Supabase integration
- Background recording
- Push notifications
- FastAPI backend implementation

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
README.md
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo app:

   ```bash
   npx expo start
   ```

3. Open on iOS, Android, or web from the Expo CLI.

## Notes

This scaffold stays intentionally small so the required architecture can be layered in later without reworking the routing setup.

A custom Expo config plugin is used for native background-audio configuration because the take-home requires background recording support on iOS and Android, and those native settings must be applied during prebuild.
