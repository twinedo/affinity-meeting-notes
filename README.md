# Affinity Meeting Notes

Minimal Expo SDK 54 baseline for the Affinity Labs take-home task.

## Included

- Expo Router setup
- Required route skeleton
- Empty `plugins/` folder
- Empty `backend/` folder

## Not Included Yet

- Supabase integration
- Background recording
- Push notifications
- FastAPI backend implementation
- Native config plugin implementation

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
