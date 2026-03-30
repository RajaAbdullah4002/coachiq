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
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)

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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks = []
    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("audio", blob, "recording.wav")
      setLoading(true)
      try {
        const res = await axios.post("http://localhost:8000/transcribe", formData)
        setInput(res.data.text)
      } catch (e) {
        console.error("Transcription failed", e)
      } finally {
        setLoading(false)
      }
      stream.getTracks().forEach(t => t.stop())
    }
    recorder.start()
    setMediaRecorder(recorder)
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorder.stop()
    setRecording(false)
  }

  return (
    <div style={{fontFamily: "'Inter', sans-serif"}} className="flex h-screen bg-[#0D0D12] text-[#E8E6E0]">

      {/* Sidebar */}
      <div className="w-64 bg-[#111118] border-r border-[#1E1E2A] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-[#1E1E2A]">
          <div style={{fontFamily: "'Syne', sans-serif"}} className="font-bold text-2xl text-yellow-400 tracking-tight">CoachIQ</div>
          <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-[#555568] uppercase tracking-widest mt-1">AI Manager Intelligence</div>
        </div>
        <div style={{fontFamily: "'DM Mono', monospace"}} className="px-5 pt-4 pb-2 text-xs text-[#444458] uppercase tracking-widest">Your Team</div>
        {EMPLOYEES.map(emp => (
          <button
            key={emp.id}
            onClick={() => setActiveEmp(emp.id)}
            className={`flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-[#181825] transition-colors ${activeEmp === emp.id ? "bg-[#1A1A28] border-l-2 border-yellow-400" : ""}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[emp.color]}`}>
              {emp.initials}
            </div>
            <span className="text-sm text-[#C8C6C0] truncate">{emp.name}</span>
            <span style={{fontFamily: "'DM Mono', monospace"}} className={`text-xs ml-auto flex-shrink-0 ${scoreColor(emp.score)}`}>{emp.score}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="px-6 py-4 border-b border-[#1E1E2A] flex items-center justify-between">
          <div className="text-base font-semibold">Coaching Session</div>
          <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs bg-green-950 text-green-400 px-3 py-1 rounded-full tracking-widest">PIPELINE ACTIVE</div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div style={{fontFamily: "'Syne', sans-serif"}} className="text-4xl font-bold text-yellow-400 mb-3">CoachIQ</div>
                <div style={{fontFamily: "'DM Mono', monospace"}} className="text-sm text-[#555568]">Ask anything about your team</div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-[#1A1A28] border border-[#2A2A3A] rounded-xl rounded-br-sm px-5 py-3 max-w-[75%] text-sm text-[#D0CEC8]">
                    {msg.text}
                  </div>
                </div>
              )}

              {msg.role === "ai" && (
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-yellow-400 tracking-widest">COACHIQ · 3 AGENTS</div>
                  </div>
                  <div className="bg-[#141420] border border-[#22223A] rounded-sm rounded-tr-xl rounded-b-xl p-5">
                    <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-[#555568] uppercase tracking-widest mb-2">Response</div>
                    <div className="text-sm text-[#C0BEB8] leading-relaxed whitespace-pre-wrap">{msg.data.answer}</div>

                    {msg.data.employees_referenced?.length > 0 && (
                      <div className="mt-4">
                        <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-[#555568] uppercase tracking-widest mb-2">Employees Referenced</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.data.employees_referenced.map((name, j) => (
                            <span key={j} className="bg-[#1A1E2A] border border-[#2A304A] rounded px-3 py-1 text-xs text-blue-400" style={{fontFamily: "'DM Mono', monospace"}}>{name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1E1E2A]">
                      <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-[#444458] uppercase tracking-widest">Bias Score</div>
                      <div className="flex-1 h-1 bg-[#1E1E2A] rounded">
                        <div
                          className={`h-1 rounded transition-all ${msg.data.bias_score > 0.5 ? "bg-red-400" : "bg-green-400"}`}
                          style={{ width: `${msg.data.bias_score * 100}%` }}
                        ></div>
                      </div>
                      <div style={{fontFamily: "'DM Mono', monospace"}} className={`text-xs ${msg.data.bias_score > 0.5 ? "text-red-400" : "text-green-400"}`}>
                        {msg.data.bias_score.toFixed(2)} · {msg.data.bias_flag ? "FLAGGED" : "CLEAN"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {msg.role === "error" && (
                <div style={{fontFamily: "'DM Mono', monospace"}} className="text-sm text-red-400">{msg.text}</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
              <div style={{fontFamily: "'DM Mono', monospace"}} className="text-xs text-yellow-400 tracking-widest">AGENTS PROCESSING...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[#1E1E2A] flex gap-3 items-center">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-4 py-3 rounded-lg text-sm font-bold transition-colors ${recording ? "bg-red-500 text-white animate-pulse" : "bg-[#1A1A28] border border-[#2A2A3A] text-[#C8C6C0] hover:border-yellow-400"}`}
          >
            {recording ? "Stop" : "Mic"}
          </button>
          <input
            className="flex-1 bg-[#111118] border border-[#22223A] rounded-lg px-5 py-3 text-sm text-[#E8E6E0] outline-none focus:border-yellow-400 transition-colors placeholder-[#444458]"
            placeholder="Ask about your team..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-[#0D0D12] font-bold text-sm px-6 py-3 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}