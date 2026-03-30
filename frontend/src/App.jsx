import { useState } from "react"
import axios from "axios"

const EMPLOYEES = [
  { id: "emp001", name: "James Wilson", initials: "JW", score: 58, color: "red" },
  { id: "emp002", name: "Sarah Chen", initials: "SC", score: 82, color: "green" },
  { id: "emp003", name: "Tom Nguyen", initials: "TN", score: 71, color: "amber" },
  { id: "emp004", name: "Priya Sharma", initials: "PS", score: 76, color: "blue" },
  { id: "emp005", name: "Marcus Johnson", initials: "MJ", score: 65, color: "purple" },
]

const scoreColor = (score) => {
  if (score >= 78) return "text-green-400"
  if (score >= 65) return "text-amber-400"
  return "text-red-400"
}

const avatarColors = {
  red: "bg-red-950 text-red-400",
  green: "bg-green-950 text-green-400",
  amber: "bg-amber-950 text-amber-400",
  blue: "bg-blue-950 text-blue-400",
  purple: "bg-purple-950 text-purple-400",
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeEmp, setActiveEmp] = useState("emp001")

  const sendMessage = async () => {
    if (!input.trim()) return
    const question = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: question }])
    setLoading(true)

    try {
      const res = await axios.post("http://localhost:8000/coach", {
        question,
        manager_name: "Manager"
      })
      setMessages(prev => [...prev, { role: "ai", data: res.data }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "error", text: "Pipeline error. Is the backend running?" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#0D0D12] text-[#E8E6E0] font-sans">

      {/* Sidebar */}
      <div className="w-48 bg-[#111118] border-r border-[#1E1E2A] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#1E1E2A]">
          <div className="font-bold text-lg text-yellow-400 tracking-tight">CoachIQ</div>
          <div className="text-[9px] text-[#555568] uppercase tracking-widest font-mono mt-0.5">AI Manager Intelligence</div>
        </div>
        <div className="px-4 pt-3 pb-1 text-[9px] text-[#444458] uppercase tracking-widest font-mono">Your Team</div>
        {EMPLOYEES.map(emp => (
          <button
            key={emp.id}
            onClick={() => setActiveEmp(emp.id)}
            className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-[#181825] transition-colors ${activeEmp === emp.id ? "bg-[#1A1A28] border-l-2 border-yellow-400" : ""}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${avatarColors[emp.color]}`}>
              {emp.initials}
            </div>
            <span className="text-xs text-[#C8C6C0] truncate">{emp.name.split(" ")[0]}</span>
            <span className={`text-[10px] font-mono ml-auto ${scoreColor(emp.score)}`}>{emp.score}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="px-5 py-3 border-b border-[#1E1E2A] flex items-center justify-between">
          <div className="text-sm font-semibold">Coaching Session</div>
          <div className="text-[9px] font-mono bg-green-950 text-green-400 px-2 py-1 rounded-full tracking-widest">PIPELINE ACTIVE</div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">CoachIQ</div>
                <div className="text-sm text-[#555568] font-mono">Ask anything about your team</div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-[#1A1A28] border border-[#2A2A3A] rounded-xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm text-[#D0CEC8]">
                    {msg.text}
                  </div>
                </div>
              )}

              {msg.role === "ai" && (
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                    <div className="text-[9px] font-mono text-yellow-400 tracking-widest">COACHIQ · 3 AGENTS</div>
                  </div>
                  <div className="bg-[#141420] border border-[#22223A] rounded-sm rounded-tr-xl rounded-b-xl p-4">
                    <div className="text-xs text-[#555568] font-mono uppercase tracking-widest mb-1">Response</div>
                    <div className="text-sm text-[#C0BEB8] leading-relaxed whitespace-pre-wrap">{msg.data.answer}</div>

                    {msg.data.employees_referenced?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[9px] font-mono text-[#555568] uppercase tracking-widest mb-1.5">Employees Referenced</div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.data.employees_referenced.map((name, j) => (
                            <span key={j} className="bg-[#1A1E2A] border border-[#2A304A] rounded px-2 py-0.5 text-xs text-blue-400 font-mono">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1E1E2A]">
                      <div className="text-[9px] font-mono text-[#444458] uppercase tracking-widest">Bias Score</div>
                      <div className="flex-1 h-0.5 bg-[#1E1E2A] rounded">
                        <div
                          className={`h-0.5 rounded transition-all ${msg.data.bias_score > 0.5 ? "bg-red-400" : "bg-green-400"}`}
                          style={{ width: `${msg.data.bias_score * 100}%` }}
                        ></div>
                      </div>
                      <div className={`text-[9px] font-mono ${msg.data.bias_score > 0.5 ? "text-red-400" : "text-green-400"}`}>
                        {msg.data.bias_score.toFixed(2)} · {msg.data.bias_flag ? "FLAGGED" : "CLEAN"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {msg.role === "error" && (
                <div className="text-xs text-red-400 font-mono">{msg.text}</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
              <div className="text-[9px] font-mono text-yellow-400 tracking-widest">AGENTS PROCESSING...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-[#1E1E2A] flex gap-3 items-center">
          <input
            className="flex-1 bg-[#111118] border border-[#22223A] rounded-lg px-4 py-2.5 text-sm text-[#E8E6E0] outline-none focus:border-yellow-400 transition-colors placeholder-[#444458]"
            placeholder="Ask about your team..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-[#0D0D12] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}