# Plivo IVR Demo

An outbound-call IVR built with Express and the Plivo API: OTP authentication (re-prompts on
wrong entry), then a two-level menu — language (English/Spanish) followed by an action
(play an audio message, or forward to a live associate).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Plivo Auth ID/Token, phone numbers, and OTP.
3. `ngrok http 3000` (or your port), copy the `https://...` URL into `PUBLIC_BASE_URL` in `.env`.
4. `npm start`

## Trigger a call
```
curl -X POST http://localhost:3000/trigger-call
```
On Windows PowerShell, `curl` is aliased to `Invoke-WebRequest` and doesn't accept `-X` — use `curl.exe` instead.
Calls `TARGET_NUMBER` from `PLIVO_FROM_NUMBER` by default. To call a different number without
editing `.env`, pass `to`:
```
curl -X POST http://localhost:3000/trigger-call -d "to=+1XXXXXXXXXX"
```

## Required credentials (see `.env.example`)
`PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN`, `PLIVO_FROM_NUMBER`, `TARGET_NUMBER`, `OTP_DDMM`,
`LIVE_ASSOCIATE_NUMBER`, `PUBLIC_BASE_URL`, `AUDIO_URL` (public MP3, defaults to a sample track),
`PORT` (optional, defaults to 3000).

## Call flow
1. `/ivr/otp` — prompts for a 4-digit OTP.
2. `/ivr/otp/verify` — wrong digits re-prompt via `/ivr/otp`; correct digits redirect to `/ivr/menu`.
3. `/ivr/menu` — Level 1: press 1 for English, 2 for Spanish.
4. `/ivr/menu/language` — invalid input re-prompts; valid input shows the Level 2 menu.
5. `/ivr/menu/level2` — press 1 to play an audio message, 2 to forward to the live associate;
   invalid input re-prompts the same menu.

State (chosen language) travels via the `lang` query param on the Level 2 action URL — no database.

## Testing without placing a real call
```
curl -X POST http://localhost:3000/ivr/otp
curl -X POST http://localhost:3000/ivr/otp/verify -d "Digits=0000"          # wrong OTP, expect re-prompt
curl -X POST http://localhost:3000/ivr/otp/verify -d "Digits=<real DDMM>"   # correct, expect redirect to /ivr/menu
curl -X POST http://localhost:3000/ivr/menu
curl -X POST http://localhost:3000/ivr/menu/language -d "Digits=1"         # English -> Level 2 menu
curl -X POST "http://localhost:3000/ivr/menu/level2?lang=en" -d "Digits=1" # play audio
curl -X POST "http://localhost:3000/ivr/menu/level2?lang=en" -d "Digits=2" # forward to associate
```

## Demo phone number used
+919034483308
