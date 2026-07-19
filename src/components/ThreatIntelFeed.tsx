import React, { useState, useEffect, useRef } from "react";
import { Terminal, Shield, AlertCircle, Zap, ShieldAlert, Cpu } from "lucide-react";

interface FeedLog {
  id: string;
  timestamp: string;
  type: "INFO" | "SUCCESS" | "ALERT" | "ATTACK";
  source: string;
  message: string;
  category: string;
}

const INITIAL_LOGS: FeedLog[] = [
  {
    id: "l-1",
    timestamp: "23:25:12",
    type: "INFO",
    source: "team_hangout",
    message: "Weekend practice session started — everyone's hopping on the voice call.",
    category: "TEAM"
  },
  {
    id: "l-2",
    timestamp: "23:25:40",
    type: "SUCCESS",
    source: "crypto_corner",
    message: "First solve of the night! That XOR challenge finally cracked after 2 hours.",
    category: "CRYPTO"
  },
  {
    id: "l-3",
    timestamp: "23:26:01",
    type: "ALERT",
    source: "web_squad",
    message: "Stuck on an SQLi filter bypass — anyone free to rubber-duck this with us?",
    category: "WEB"
  },
  {
    id: "l-4",
    timestamp: "23:26:45",
    type: "ATTACK",
    source: "pwn_learners",
    message: "Working through our first buffer overflow on picoCTF. Slow but we're getting it.",
    category: "PWN"
  },
  {
    id: "l-5",
    timestamp: "23:27:01",
    type: "SUCCESS",
    source: "osint_crew",
    message: "Geolocated the challenge photo from a street sign reflection. Feeling like detectives.",
    category: "OSINT"
  }
];

const TOP_TEAMS = ["Perfect Blue", "PPP", "DiceGang", "More Smoked Leek", "WreckTheLine"];
const CHALLENGE_NAMES = [
  "baby-rev-101",
  "cookie-monster",
  "caesar-salad",
  "format-string-fun",
  "packet-detective",
  "hidden-in-plain-sight",
  "stack-smash-starter"
];

export default function ThreatIntelFeed() {
  const [logs, setLogs] = useState<FeedLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<"ALL" | "GRIND" | "TEAM" | "SOLVES">("ALL");
  const [hypeLevel, setHypeLevel] = useState(72);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Generate dynamic logs periodically to keep the feed feeling alive
  useEffect(() => {
    const timer = setInterval(() => {
      const typeRand = Math.random();
      let newLog: FeedLog;
      const timeStr = new Date().toTimeString().split(" ")[0];

      if (typeRand < 0.25) {
        // Solving challenge
        const squad = ["web_squad", "crypto_corner", "pwn_learners", "osint_crew"][Math.floor(Math.random() * 4)];
        const challenge = CHALLENGE_NAMES[Math.floor(Math.random() * CHALLENGE_NAMES.length)];
        newLog = {
          id: `l-${Date.now()}`,
          timestamp: timeStr,
          type: "SUCCESS",
          source: squad,
          message: `Solved "${challenge}"! Writeup coming soon so everyone can learn from it.`,
          category: "SOLVE"
        };
      } else if (typeRand < 0.5) {
        // Watching the pros
        const team = TOP_TEAMS[Math.floor(Math.random() * TOP_TEAMS.length)];
        newLog = {
          id: `l-${Date.now()}`,
          timestamp: timeStr,
          type: "ATTACK",
          source: "scoreboard_watch",
          message: `${team} just climbed the board. Studying their old writeups — one day that's us.`,
          category: "GRIND"
        };
      } else if (typeRand < 0.75) {
        // Someone stuck / asking for help
        newLog = {
          id: `l-${Date.now()}`,
          timestamp: timeStr,
          type: "ALERT",
          source: "help_channel",
          message: `Someone's stuck on a reversing challenge — hopping in to pair on it. That's how we learn.`,
          category: "TEAM"
        };
      } else {
        // Regular info
        newLog = {
          id: `l-${Date.now()}`,
          timestamp: timeStr,
          type: "INFO",
          source: "team_hangout",
          message: `New practice challenges queued up from picoCTF and HackTheBox. Come grind with us.`,
          category: "TEAM"
        };
      }

      setLogs((prev) => {
        const next = [...prev, newLog];
        // Keep last 40 logs
        if (next.length > 40) next.shift();
        return next;
      });

      // Fluctuate hype level slightly
      setHypeLevel((prev) => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(30, Math.min(99, prev + diff));
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "GRIND") return log.type === "ATTACK" || log.type === "ALERT";
    if (activeTab === "TEAM") return log.category === "TEAM";
    if (activeTab === "SOLVES") return log.type === "SUCCESS";
    return true;
  });

  return (
    <div className="war-room p-4 md:p-6 relative overflow-hidden flex flex-col h-[500px]">
      {/* Absolute top scanline overlay inside container */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--red-core)]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-default)] pb-3 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 text-[var(--red-core)]">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)] uppercase tracking-wider">
              TEAM ACTIVITY LOG
            </h3>
            <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase">
              WHAT WE'RE HACKING ON RIGHT NOW
            </p>
          </div>
        </div>

        {/* Live status indicators */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[var(--text-dim)] uppercase">HYPE LEVEL</span>
            <span className={`font-bold tracking-widest ${hypeLevel > 80 ? "text-[var(--text-red)]" : "text-[var(--text-amber)]"}`}>
              {hypeLevel}% LOCKED_IN
            </span>
          </div>
          <div className="h-8 w-px bg-[var(--border-default)]" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[var(--text-dim)] uppercase">SQUAD</span>
            <span className="text-[var(--text-green)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-green)]" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)] mb-3 text-xs font-mono select-none overflow-x-auto gap-1">
        {(["ALL", "GRIND", "TEAM", "SOLVES"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-all font-semibold uppercase tracking-wider ${
              activeTab === tab
                ? "border-[var(--red-core)] text-[var(--red-core)] bg-[var(--border-default)]/20"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrolling Stream log body */}
      <div
        ref={scrollRef}
        className="feed-scroll flex-1 overflow-y-auto flex flex-col gap-1 p-2 bg-[var(--bg-void)] border border-[var(--border-default)] text-left"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-dim)] italic gap-2 py-20">
            <ShieldAlert className="w-8 h-8 opacity-40 text-[var(--text-dim)]" />
            <span>NOTHING HERE YET — TRY ANOTHER TAB</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            let typeBadge = "";
            let badgeClass = "feed-tag ";
            let textClass = "";

            switch (log.type) {
              case "INFO":
                typeBadge = "TEAM";
                badgeClass += "";
                textClass = "";
                break;
              case "SUCCESS":
                typeBadge = "SOLVED";
                badgeClass += "solved";
                textClass = "highlight";
                break;
              case "ALERT":
                typeBadge = "HELP";
                badgeClass += "attack";
                textClass = "";
                break;
              case "ATTACK":
                typeBadge = "GRIND";
                badgeClass += "attack";
                textClass = "text-red-500";
                break;
            }

            return (
              <div key={log.id} className="feed-row">
                <span className="feed-time">{log.timestamp}</span>
                <span className={badgeClass}>{typeBadge}</span>
                <span className="feed-text">
                  <strong>@{log.source}:</strong> <span className={textClass}>{log.message}</span>
                </span>
                <span className="feed-points">{log.category}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Diagnostic Panel */}
      <div className="mt-3 pt-3 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[var(--text-dim)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> BRAIN_CELLS: FIRING
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">SNACK_SUPPLY: 14%</span>
        </div>
        <div className="text-[var(--text-red)] uppercase tracking-widest font-semibold mt-2 sm:mt-0">
          MODE: ALWAYS_LEARNING // ALWAYS_HUNGRY
        </div>
      </div>
    </div>
  );
}
