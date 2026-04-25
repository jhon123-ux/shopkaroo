// Generates or retrieves a persistent anonymous session ID
// stored in localStorage. Works for both guests and logged-in users.
// This is what links cart data to a browser without requiring login.

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const KEY = 'sk_session_id'
  let id = localStorage.getItem(KEY)
  
  if (!id) {
    // Generate a random UUID for this browser
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  
  return id
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('sk_session_id')
}
