import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Mic, MicOff, AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react';

export default function CopilotChat({ onClose, onRefreshData }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your QuantumRoute AI Copilot. Ask me about active fleet status, vehicle loads, QUBO quantum optimization, fuel savings, or say "Reassign V02" to test action confirmation.',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, actionModal]);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    const userMsg = { sender: 'user', text: promptText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText }),
      });
      const data = await res.json();

      const aiMsg = {
        sender: 'ai',
        text: data.response,
        toolUsed: data.tool_used,
        data: data.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Trigger Action Confirmation Modal if action payload present
      if (data.action_confirmation) {
        setActionModal(data.action_confirmation);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to Copilot service.', timestamp: 'Just now' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    try {
      await fetch('/api/copilot/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          target_id: actionModal.target_id,
          params: actionModal.proposed_changes
        }),
      });
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `✅ ACTION CONFIRMED & EXECUTED: ${actionModal.title}`, timestamp: 'Just now' }
      ]);
      setActionModal(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      handleSend(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const promptSuggestions = [
    'Show active vehicles',
    'Reassign V02 deliveries',
    'How much fuel did we save?',
    'Explain Quantum Optimization',
    'Which vehicle is overloaded?'
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[3000] w-96 max-w-[calc(100vw-2rem)] h-[580px] glass-panel-glow rounded-2xl border border-purple-500/50 shadow-2xl flex flex-col overflow-hidden">
      {/* Copilot Header */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100">QuantumRoute AI Copilot</h3>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                Tool Calling Active
              </span>
            </div>
            <p className="text-[10px] text-purple-300">Fleet Operations & Optimization AI Assistant</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-xl max-w-[85%] ${
              m.sender === 'user'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
            }`}>
              {m.sender === 'ai' && m.toolUsed && (
                <div className="text-[9px] text-cyan-400 font-mono mb-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Tool Executed: <strong>{m.toolUsed}()</strong>
                </div>
              )}
              <div className="leading-relaxed">{m.text}</div>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-xs italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" /> Calling backend tools & parsing operational state...
          </div>
        )}

        {/* Action Confirmation Modal Card inside chat */}
        {actionModal && (
          <div className="bg-slate-900 border-2 border-amber-500/60 p-3.5 rounded-xl space-y-2 shadow-xl animate-pulse">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" /> {actionModal.title}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{actionModal.description}</p>
            
            <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono text-purple-300 space-y-1">
              <div>Proposed Assignments: {JSON.stringify(actionModal.proposed_changes)}</div>
              <div>Est. Add. Distance: +{actionModal.impact_metrics.estimated_additional_distance_km} km</div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmAction}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded text-xs transition"
              >
                Confirm Reassignment
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-900 flex gap-1.5 overflow-x-auto no-scrollbar">
        {promptSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 px-2 py-1 rounded-full whitespace-nowrap transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={handleSpeech}
          className={`p-2 rounded-xl transition ${listening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          title="Voice Command"
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder="Type or speak logistics command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-purple-400 outline-none"
        />

        <button
          onClick={() => handleSend()}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white p-2 rounded-xl transition shadow-lg shadow-purple-900/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
