import React from 'react'
import './App.css'


const SSO_FRONT = process.env.REACT_APP_SSO_FRONT || 'https://sso.dhp.uz'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || 'patient_portal'
const GRANT_TYPE = process.env.REACT_APP_GRANT_TYPE || 'authorization_code'
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'https://portal.dhp.uz/deff'

// localStorage keys
const CODE_VERIFIER_KEY = 'phj_pkce_code_verifier'
const CODE_CHALLENGE_KEY = 'phj_pkce_code_challenge'

// ==== PKCE HELPERS ====
function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}

function generateCodeVerifier() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(128)
  window.crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return buf2hex(digest)
}

function App() {
  const redirectToSSO = async () => {
    try {
      const next = '/patient-info'

      // 1)  PKCE
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier)
      localStorage.setItem(CODE_CHALLENGE_KEY, codeChallenge)

      const url = new URL(SSO_FRONT)
      url.searchParams.set('client_id', CLIENT_ID)
      url.searchParams.set('grant_type', GRANT_TYPE)
      url.searchParams.set('code_challenge', codeChallenge)
      url.searchParams.set('redirect_uri', REDIRECT_URI)
      url.searchParams.set('state', encodeURIComponent(next))



      console.log('SSO AUTH URL →', url.toString())

      window.location.replace(url.toString())
    } catch (e) {
      console.error('SSO redirect error:', e)
      alert('Ошибка редиректа (см. консоль)')
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={redirectToSSO} className="button">
          Redirect SSO
        </button>
      </header>
    </div>
  )
}

export default App
