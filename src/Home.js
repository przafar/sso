import './App.css';


function App() {

  function base64urlencode(str) {
    const bytes = new Uint8Array(str);
    const regularArray = Array.from(bytes);
    // Convert the input string to base64url format
    return btoa(String.fromCharCode.apply(null, regularArray))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  
  async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const crypto = await window.crypto.subtle.digest("SHA-256", data);
  
    return crypto;
  }
  
  async function kceChallengeFromVerifier(v) {
    const hashed = await sha256(v);
    return base64urlencode(hashed);
  }
  
  function generateRandomString() {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => `0${dec.toString(16)}`.substr(-2)).join("");
  }
  
  async function redirectToSSO() {
    // Generate and store a random "state" value
    const state = generateRandomString();
    localStorage.setItem("pkce_state", state);
  
    // Generate and store a new PKCE code_verifier (plaintext random secret)
    const codeVerifier = generateRandomString();
    localStorage.setItem("pkce_code_verifier", codeVerifier);
  
    // Hash and base64-urlencode the secret to use as the challenge
    const codeChallenge = await kceChallengeFromVerifier(codeVerifier);
  
    // Build the authorization URL
    const url =
      `https://test-sso.ssv.uz/oauth/authorize?response_type=code` +
      `&client_id=` +
      `97c3e637-6441-4cbe-95fa-5cbf6fb907a3` +
      `&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(
        "http://localhost:3000/auth/callback"
      )}&code_challenge=${encodeURIComponent(
        codeChallenge
      )}&code_challenge_method=S256`;
  
    console.log("url", url);
  
    // Redirect to the authorization server
    window.location.href = url;
  }
  

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={redirectToSSO} className="button">Redirect SSO</button>
      </header>
     
    </div>
  );
}

export default App;