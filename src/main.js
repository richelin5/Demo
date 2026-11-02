import './style.css'
import { supabase } from './supabase.js'

const $ = (id) => document.getElementById(id)
const loginEl = $('login')
const profileEl = $('profile')
const errorEl = $('error')

function showError(message) {
  errorEl.textContent = message
  errorEl.hidden = !message
}

function render(session) {
  const user = session?.user
  loginEl.hidden = !!user
  profileEl.hidden = !user
  if (!user) return

  const meta = user.user_metadata ?? {}
  const name = meta.full_name || meta.name || user.email
  const picture = meta.avatar_url || meta.picture

  $('name').textContent = name
  $('email').textContent = user.email ?? ''
  $('provider').textContent = user.app_metadata?.provider ?? 'unknown'

  const avatar = $('avatar')
  if (picture) {
    avatar.src = picture
    avatar.alt = `${name}'s profile picture`
    avatar.hidden = false
  } else {
    avatar.hidden = true
  }
}

$('google-btn').addEventListener('click', async () => {
  showError('')
  // Send the user back to exactly the page they started on.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  })
  if (error) showError(error.message)
})

$('signout-btn').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()
  if (error) showError(error.message)
})

// Surface errors Google/Supabase put in the redirect URL (e.g. user not on Test users list).
const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
const urlError = params.get('error_description')
if (urlError) showError(decodeURIComponent(urlError.replace(/\+/g, ' ')))

const { data } = await supabase.auth.getSession()
render(data.session)
supabase.auth.onAuthStateChange((_event, session) => render(session))
