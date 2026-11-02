# Demo — Sign in with Google (Supabase)

Vite + supabase-js app with a **Continue with Google** button. After login it shows the user's
name and profile picture from `user_metadata`, plus the provider used.

## Setup
1. Finish the Supabase + Google Cloud steps (Google provider enabled in Supabase with your
   Client ID/secret; the secret lives **only** in Supabase).
2. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   (Supabase → Project Settings → API).
3. In Supabase → Authentication → URL Configuration, add `http://localhost:5173/**` and
   `https://yoursite.netlify.app/**` to **Redirect URLs**, or the redirect back will fall back to the Site URL.

## Run
```bash
npm install
npm run dev   # http://localhost:5173
```

## Deploy (Netlify)
`netlify.toml` builds with `npm run build` and publishes `dist`. Set the two `VITE_…` variables
in Netlify → Site configuration → Environment variables.
