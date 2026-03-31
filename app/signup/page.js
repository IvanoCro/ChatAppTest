"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleSignup(e) {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)

    if (!email || !password || !name) {
      setErrorMsg("Popuni sva polja")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: name
        }
      }
    })


    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    alert("Account napravljen! Sad se logiraj.")
    router.push("/login")
  }

  return (
  <div className="auth-container">
    <div className="auth-card">
      <h2>Napravi račun</h2>

      {errorMsg && <p className="auth-error">{errorMsg}</p>}

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="auth-input"
          required
        />

        <input
          type="email"
          placeholder="Email adresa"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          required
        />

        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          className="auth-button"
        >
          {loading ? "Kreiram račun..." : "Napravi račun"}
        </button>
      </form>

      <p className="auth-msg">
        Već imaš račun?{" "}
        <span onClick={() => router.push("/login")}>
          Prijavi se
        </span>
      </p>
    </div>
  </div>
)
}