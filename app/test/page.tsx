"use client"

import { supabase } from "../../lib/supabase"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function TestPage() {
  const [msg, setMsg] = useState("")
  const [data, setData] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  const lastSentTime = useRef(0)
  const router = useRouter()

  async function fetchMsgs() {
    try {
      const { data, error } = await supabase
        .from("msgs")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("FETCH ERROR:", error)
        setErrorMsg(error.message)
        return
      }

      setData(data || [])
    } catch (err) {
      console.error("fetchMsgs CRASH:", err)
      setErrorMsg(err.message)
    }
  }

  useEffect(() => {
    let channel

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)

      await fetchMsgs()

      channel = supabase
        .channel("msgs-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "msgs" },
          () => {
            fetchMsgs()
          }
        )
        .subscribe()

      setLoading(false)
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router])

  async function insertInBase(e) {
    e.preventDefault()
    setErrorMsg("")

    if (!user) {
      setErrorMsg("Nema usera")
      return
    }

    if (!msg.trim()) {
      setErrorMsg("Prazna poruka")
      return
    }

    const now = Date.now()

    if (now - lastSentTime.current < 3000) {
      setErrorMsg("Prebrzo šalješ")
      return
    }

    try {
      const { error } = await supabase
        .from("msgs")
        .insert([{
          msg: msg, 
          user_id: user.id,
          user_name: user.user_metadata?.user_name
        }])

      if (error) {
        console.error("INSERT ERROR:", error)
        setErrorMsg(error.message)
        return
      }

      lastSentTime.current = now
      setMsg("")
      fetchMsgs()

    } catch (err) {
      console.error("insertInBase CRASH:", err)
      setErrorMsg(err.message)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="page">
      <div className="intro">
        <h1>Testiranje</h1>
        <p>
          Ulogiran kao: <b>{user?.user_metadata?.user_name || user?.email}</b>
        </p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {errorMsg && <div className="error-msg">ERROR: {errorMsg}</div>}

      <div className="msg-container">
        {data.map((item) => (
          <div 
            key={item.msg_id} 
            className={`msg-card ${item.user_name === (user?.user_metadata?.user_name || user?.email) ? 'own' : ''}`}
          >
            <p>
              <b>{item.user_name || "Anon"}:</b> {item.msg}
            </p>
          </div>
        ))}
      </div>

      <div className="msg-form-container">
        <form onSubmit={insertInBase}>
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Upiši poruku..."
          />
          <button type="submit">Pošalji</button>
        </form>
      </div>
    </div>
  )
}