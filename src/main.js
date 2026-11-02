import './style.css'
import { supabase } from './supabase.js'

const $ = (id) => document.getElementById(id)
const loginEl = $('login')
const profileEl = $('profile')
const errorEl = $('error')

const noticeEl = $('notice')

function showError(message) {
  errorEl.textContent = message
  errorEl.hidden = !message
  if (message) showNotice('')
}

function showNotice(message) {
  noticeEl.textContent = message
  noticeEl.hidden = !message
}

function credentials() {
  return { email: $('email-input').value.trim(), password: $('password-input').value }
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

// Email + password sign in.
$('email-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  showError('')
  const { email, password } = credentials()
  if (!email || !password) return showError('Enter your email and password.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) showError(error.message)
})

// Email + password sign up. If "Confirm email" is on in Supabase, no session is returned yet.
$('signup-btn').addEventListener('click', async () => {
  showError('')
  const { email, password } = credentials()
  if (!email || password.length < 6) return showError('Enter an email and a password of at least 6 characters.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.href },
  })
  if (error) return showError(error.message)
  if (!data.session) showNotice(`Check ${email} for a confirmation link.`)
})

// Passwordless magic link.
$('magic-btn').addEventListener('click', async () => {
  showError('')
  const { email } = credentials()
  if (!email) return showError('Enter your email first.')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  })
  if (error) return showError(error.message)
  showNotice(`Magic link sent to ${email}. Open it on this device.`)
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
