"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)

    if (!email || !password) {
      setErrorMsg("Popuni sva polja")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    router.push("/test")
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {errorMsg && <p className="auth-error">{errorMsg}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="auth-msg">
          Nemaš račun?{" "}
          <span onClick={() => router.push("/signup")}>
            Napravi ga
          </span>
        </p>
      </div>
    </div>
  )
}