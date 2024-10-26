# New App

An assistant app for the blind.

## User Journeys

### 1. Sign In

1. Upon opening the app, the user is presented with a sign-in page.
2. The user can sign in using email (magic link) or via social providers (Google, Facebook, Apple).
3. Above the authentication component, there is a heading "Sign in with ZAPT" and a link to [ZAPT](https://www.zapt.ai) that opens in a new tab.
4. Once signed in, the user is redirected to the home page.

### 2. Using the Assistant

1. On the home page, the user sees a button labeled "Start Recording".
2. The user presses the "Start Recording" button to begin speaking their query.
3. The app listens to the user's speech and converts it to text using speech recognition.
4. The transcribed text is sent to the assistant (ChatGPT) to generate a response.
5. The assistant's response is converted to speech using text-to-speech.
6. The app plays the audio response to the user.
7. The user can repeat the process by pressing the "Start Recording" button again.

## Details of Each Step

- **Speech Recognition**: The app uses the Web Speech API to capture the user's voice and transcribe it into text.
- **Assistant Response**: The transcribed text is sent to the backend using `createEvent` with event type `chatgpt_request`. The assistant generates a response based on the user's query.
- **Text-to-Speech**: The assistant's response is then sent to the backend using `createEvent` with event type `text_to_speech`. The backend returns a URL to the audio file.
- **Audio Playback**: The app plays the audio response to the user, providing an audible reply.

## External APIs and Services

- **Supabase**: Used for user authentication.
- **ZAPT**: Used to send events to the backend (`createEvent`) for processing ChatGPT requests and text-to-speech conversion.
- **Progressier**: Adds PWA (Progressive Web App) support to the app.
- **Web Speech API**: Native browser API used for speech recognition.

## Environment Variables

- `VITE_PUBLIC_APP_ID`: The public app ID used by ZAPT and Progressier.