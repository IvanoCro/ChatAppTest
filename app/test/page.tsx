"use client"
import { supabase } from "../../lib/supabase"
import { useEffect, useState, useRef } from "react"

export default function TestPage() {

    const [msg, setMsg] = useState("");
    const [data, setData] = useState([]);
    const lastSentTime = useRef(0);
    async function fetchMsgs() {
        const { data: msgsData, error } = await supabase
            .from("msgs")
            .select("*")

        if (error) {
            console.log(error)
        } else {
            setData(msgsData)
        }
    }

    useEffect(() => {
    fetchMsgs()

    const channel = supabase
        .channel("msgs-channel")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "msgs" },
            (payload) => {
                console.log("Promjena:", payload)
                fetchMsgs() // refresh kad se nešto promijeni
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}, [])

   async function insertInBase(e) {
    e.preventDefault();

    const now = Date.now();

    
    if (now - lastSentTime.current < 3000) {
        alert("Prebrzo šalješ poruke majmune");
        return;
    }

    if (!msg.trim()) return;

    const { error } = await supabase
        .from("msgs")
        .insert([{ msg: msg }]);

    if (error) {
        console.log(error);
    } else {
        lastSentTime.current = now; // update timer
        setMsg("");
        fetchMsgs();
    }
}

    return (
        <div className="page">
            <div className="intro">
                <h1>Testiranje</h1>
                <p>Budite good lil boys i nemojte spamat previse</p>
            </div>

            <div className="msg-container">
                {data.map((item) => (
                    <div key={item.msg_id} className="msg-card">
                        <span className="msg-id">#{item.msg_id}</span>
                        <p className="msg-text">{item.msg}</p>
                    </div>
                ))}
            </div>

            <div className="msg-form-container">
                <form onSubmit={insertInBase}>
                    <input
                        type="text"
                        placeholder="Vaša poruka..."
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                    />
                    <button type="submit">Pošalji</button>
                </form>
            </div>
        </div>
    )
}