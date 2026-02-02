/* ================================================================
   MUD TERMINAL - Retro Text Adventure Interface
   ================================================================ */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Square, Terminal, Send, Bot, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalMessage {
  id: string;
  text: string;
  type: "system" | "input" | "output" | "agent" | "broadcast";
  timestamp: Date;
}

export default function MUDTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [agentActive, setAgentActive] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  // Connect to MUD server
  const connect = () => {
    const ws = new WebSocket("ws://localhost:4008");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addMessage("Connected to Harris Wilderness MUD", "system");
      // Send player name if we have one
      if (playerName) {
        ws.send(JSON.stringify({ command: playerName }));
      }
    };

    ws.onclose = () => {
      setConnected(false);
      addMessage("Disconnected from MUD server", "system");
      // Auto-reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      addMessage("Connection error. Retrying...", "system");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    };
  };

  const handleServerMessage = (data: any) => {
    const text = data.text || "";
    
    // Detect message type based on content
    let type: TerminalMessage["type"] = "output";
    if (data.type === "system") type = "system";
    else if (data.type === "broadcast") type = "broadcast";
    else if (text.includes("OpenClaw") || text.includes("Agent")) type = "agent";
    
    addMessage(text, type);

    // Update player count if mentioned
    if (text.includes("Players Online")) {
      const match = text.match(/(\d+)/);
      if (match) setPlayerCount(parseInt(match[0]));
    }
  };

  const addMessage = (text: string, type: TerminalMessage["type"]) => {
    const newMessage: TerminalMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendCommand = (cmd: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: cmd }));
      addMessage(`> ${cmd}`, "input");
      setInput("");
    } else {
      addMessage("Not connected to MUD server", "system");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // First message is player name if not set
      if (!playerName) {
        setPlayerName(input.trim());
      }
      sendCommand(input.trim());
    }
  };

  const toggleAgent = () => {
    const cmd = agentActive ? "!!autopilot off" : "!!autopilot on";
    sendCommand(cmd);
    setAgentActive(!agentActive);
  };

  // Initial connection
  useEffect(() => {
    connect();
    // Add welcome message
    addMessage("╔══════════════════════════════════════════╗", "system");
    addMessage("║      HARRIS WILDERNESS MUD v1.0          ║", "system");
    addMessage("║         [RETRO TERMINAL MODE]            ║", "system");
    addMessage("╚══════════════════════════════════════════╝", "system");
    addMessage("Enter your name to begin...", "system");
    
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-400 font-mono tracking-wider">
          MUD TERMINAL
        </h1>
        <p className="text-muted-foreground mt-1">
          Harris Wilderness - Retro Text Adventure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Terminal */}
        <Card className="lg:col-span-3 bg-black border-emerald-500/30">
          <CardHeader className="border-b border-emerald-500/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-400 font-mono text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Terminal
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  )} />
                  <span className="text-muted-foreground">
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {playerCount} online
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Terminal Output */}
            <div
              ref={terminalRef}
              className="h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-1 bg-black"
              style={{
                backgroundImage: "linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px)",
                backgroundSize: "100% 2px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    msg.type === "system" && "text-cyan-400",
                    msg.type === "input" && "text-emerald-300",
                    msg.type === "output" && "text-emerald-400",
                    msg.type === "agent" && "text-yellow-400",
                    msg.type === "broadcast" && "text-purple-400"
                  )}
                >
                  <span className="text-emerald-700 text-xs mr-2">
                    [{msg.timestamp.toLocaleTimeString()}]
                  </span>
                  {msg.text}
                </div>
              ))}
              <div className="animate-pulse text-emerald-500">_</div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-emerald-500/20 p-4 flex gap-2">
              <span className="text-emerald-500 font-mono py-2">{playerName ? ">" : "Name:"}</span>
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={playerName ? "Enter command..." : "Enter your name..."}
                className="flex-1 bg-black border-emerald-500/30 text-emerald-400 font-mono placeholder:text-emerald-700"
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50"
              >
                <Send className="w-4 h-4 text-emerald-400" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Agent Control */}
          <Card className="bg-black/50 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 font-mono text-sm flex items-center gap-2">
                <Bot className="w-4 h-4" />
                OpenClaw Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={toggleAgent}
                variant={agentActive ? "destructive" : "default"}
                className={cn(
                  "w-full font-mono",
                  agentActive 
                    ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50" 
                    : "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-400"
                )}
              >
                {agentActive ? (
                  <><Square className="w-4 h-4 mr-2" /> Stop Agent</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Start Agent</>
                )}
              </Button>
              
              {agentActive && (
                <div className="text-xs text-yellow-400/70 font-mono space-y-1">
                  <p>• Autonomous mode active</p>
                  <p>• Exploring world...</p>
                  <p>• Creating content...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <Card className="bg-black/50 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-400 font-mono text-sm">
                Quick Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { cmd: "look", desc: "Look around" },
                { cmd: "go north", desc: "Move north" },
                { cmd: "inventory", desc: "Check items" },
                { cmd: "who", desc: "List players" },
                { cmd: "say hello", desc: "Speak" },
                { cmd: "help", desc: "Show help" },
              ].map(({ cmd, desc }) => (
                <Button
                  key={cmd}
                  variant="ghost"
                  size="sm"
                  onClick={() => sendCommand(cmd)}
                  className="w-full justify-between text-left font-mono text-xs hover:bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-400"
                >
                  <span>{cmd}</span>
                  <span className="text-emerald-600">{desc}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-black/50 border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-400 font-mono text-sm">
                World Status
              </CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-xs space-y-2 text-emerald-400/70">
              <div className="flex justify-between">
                <span>Server:</span>
                <span className={connected ? "text-emerald-400" : "text-red-400"}>
                  {connected ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span className="text-emerald-400">{playerCount}</span>
              </div>
              <div className="flex justify-between">
                <span>WebSocket:</span>
                <span className="text-emerald-400">ws://localhost:4008</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card className="mt-6 bg-black/30 border-emerald-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-emerald-400">TIP:</span> Type commands and press Enter. 
            Use "go [direction]" to move, "look" to see your surroundings, "say [message]" to talk. 
            The OpenClaw Agent can explore autonomously when activated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
