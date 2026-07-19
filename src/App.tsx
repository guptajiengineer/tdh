import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Shield, Terminal, Users, Trophy, BookOpen, FileText,
  Search, Filter, Clock, ArrowUpRight, Lock, Github, Twitter,
  ExternalLink, Code, Globe, HelpCircle, Eye, AlertTriangle, Play
} from "lucide-react";

import BootSequence from "./components/BootSequence";
import ThreatIntelFeed from "./components/ThreatIntelFeed";
import WriteupReader from "./components/WriteupReader";
import AdminPanel from "./components/AdminPanel";
import JoinForm from "./components/JoinForm";
import NavBar from "./components/NavBar";
import { Member, CTFEvent, Writeup, BlogPost, Application } from "./types";

const SectionDivider = () => (
  <div className="w-full border-t-2 border-[var(--border-default)] my-16" />
);

export default function App() {
  const [booting, setBooting] = useState(true);
  
  // Navigation State
  // "home" | "ctfs" | "writeups" | "blog" | "team" | "apply" | "admin" | "writeup-detail"
  const [currentView, setCurrentView] = useState("home");
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);

  // Admin Login States
  const [adminToken, setAdminToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("dh_admin_token") : null
  );
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [ctfs, setCtfs] = useState<CTFEvent[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Filters
  const [ctfFilterYear, setCtfFilterYear] = useState("ALL");
  const [writeupCategory, setWriteupCategory] = useState("ALL");
  const [writeupDifficulty, setWriteupDifficulty] = useState("ALL");

  // Selected team member for modal detail
  const [selectedTeamMember, setSelectedTeamMember] = useState<Member | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  // Fetch all state from server API
  const fetchAllData = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setCtfs(data.ctf_events || []);
        setWriteups(data.writeups || []);
        setBlogs(data.blog_posts || []);
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error("Failed to load data from Express API", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentView]);

  // Admin login handling
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        localStorage.setItem("dh_admin_token", data.token);
        setAdminEmail("");
        setAdminPassword("");
      } else {
        setLoginError(data.error || "ACCESS DENIED: Authentication breach aborted.");
      }
    } catch (err) {
      setLoginError("FATAL: Failed to establish secure contact with core server.");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("dh_admin_token");
    setCurrentView("home");
  };

  const readWriteup = async (w: Writeup) => {
    setSelectedWriteup(w);
    setCurrentView("writeup-detail");
    // Register visual solve-view on server
    try {
      await fetch(`/api/writeups/${w.id}/view`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--red-core)]/30 selection:text-[var(--text-primary)]">
      <AnimatePresence>
        {booting && (
          <BootSequence onComplete={() => setBooting(false)} />
        )}
      </AnimatePresence>

      {!booting && (
        <div className="flex flex-col min-h-screen">
          {/* Navigation Bar */}
          <NavBar
            currentView={currentView}
            onNavigate={(view) => {
              setCurrentView(view);
              setSelectedWriteup(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isAdminLoggedIn={!!adminToken}
            onGoAdmin={() => {
              setCurrentView("admin");
              setSelectedWriteup(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {/* Site Announcement Banner from settings CMS */}
          {settings.announcement_banner && currentView !== "admin" && (
            <div className="alert-banner mt-[70px]">
              <span className="icon">!</span>
              <strong>ALERT:</strong> <span>{settings.announcement_banner}</span>
            </div>
          )}

          {/* Main App Container */}
          <div className={`flex-1 flex flex-col ${settings.announcement_banner ? "" : "pt-[70px]"}`}>
            
            {/* Page transitions */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              key={currentView}
              className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8"
            >

              {/* VIEW: HOME PAGE */}
              {currentView === "home" && (
                <div className="space-y-12">
                  
                  {/* Hero section */}
                  <motion.section 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="hero p-8 md:p-14 mb-16"
                  >
                    <div className="hero-pattern" />
                    <div className="relative z-10 w-full flex flex-col items-start text-left">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="text-hero text-[var(--text-primary)] mb-6"
                      >
                        THE DEVIL<br />HUNTERS.
                      </motion.h1>

                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-tagline mb-8 max-w-2xl"
                      >
                        {settings.team_motto || "We don't play CTFs. We hunt them."}
                      </motion.p>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-body max-w-2xl mb-12"
                      >
                        We are an elite, highly structured cybersecurity CTF division specializing in advanced memory corruption, brownfield cryptographic attacks, and reverse engineering JIT runtime frameworks.
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="hero-stats w-full max-w-3xl"
                      >
                        <div className="hero-stat">
                          <div className="hero-stat-label">CHAMPIONSHIPS</div>
                          <div className="hero-stat-value text-[var(--text-primary)]">
                            {ctfs.filter((c) => !c.is_upcoming).length}
                          </div>
                        </div>
                        <div className="hero-stat">
                          <div className="hero-stat-label">FLAGS LOGGED</div>
                          <div className="hero-stat-value text-[var(--red-core)]">
                            1,048
                          </div>
                        </div>
                        <div className="hero-stat">
                          <div className="hero-stat-label">GLOBAL RANK</div>
                          <div className="hero-stat-value text-[var(--text-green)]">
                            #4
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.section>

                  {/* Operational Notice and Live Interactive War Room Log Feed */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] border-b border-[var(--border-default)] pb-2 uppercase tracking-wider">
                      <span>TACTICAL INTEL STREAM // LIVE_FEED</span>
                      <span className="text-[var(--red-core)] font-semibold">● ACTIVE_WAR_ROOM</span>
                    </div>
                    
                    <ThreatIntelFeed />
                  </section>

                  <SectionDivider />

                  {/* 6 Specialization Domain Cards section */}
                  <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-section-title text-[var(--text-primary)]">
                        SURVEILLANCE OPERATIONS DOMAINS
                      </h2>
                      <p className="text-label mt-1">
                        Our specialized cells deployed across cybersecurity battlefields
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { title: "Web Exploitation", desc: "Forging requests, racing state pools, bypassing filters, and remote code execution payloads.", tag: "Web" },
                        { title: "Reverse Engineering", desc: "Disassembling obfuscated assembly blocks, patching binaries, and analyzing custom JIT runtimes.", tag: "Reverse" },
                        { title: "OSINT Intelligence", desc: "Geographic geolocation, deep metadata carving, hostile signal traces, and open source reconnaissance.", tag: "OSINT" },
                        { title: "Digital Forensics", desc: "Memory dumps analysis, capturing system states, recovering deleted storage blocks, and packet traces.", tag: "Forensics" },
                        { title: "Advanced Cryptography", desc: "Algebraic side-channel correlations, cracking customized AES whiteboxes, and quantum-safe algorithms.", tag: "Crypto" },
                        { title: "PWN & Core Exploitation", desc: "Heap grooming, browser sandbox bypasses, kernel privilege escalations, and virtual architecture escapes.", tag: "PWN" }
                      ].map((cell, idx) => {
                        const count = writeups.filter((w) => w.category.toLowerCase() === cell.tag.toLowerCase()).length;
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            key={idx}
                            onClick={() => {
                              setWriteupCategory(cell.tag);
                              setCurrentView("writeups");
                            }}
                            className="domain-card"
                          >
                            <div className="domain-icon">
                              <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="domain-title">{cell.title}</h3>
                            <p className="domain-desc">{cell.desc}</p>
                            <div className="domain-count">
                              RECORDS_LOGGED: <span>{count}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>

                  <SectionDivider />

                  {/* Recent CTF Competitions Panel (Last 3) */}
                  <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <h2 className="text-section-title text-[var(--text-primary)]">
                          RECENT CTF CONFLICTS
                        </h2>
                        <p className="text-label mt-1">
                          Trophy placements on global cyber boards
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentView("ctfs")}
                        className="font-mono text-xs text-[var(--text-red)] hover:text-[var(--text-primary)] uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>VIEW ALL DEPLOYMENTS</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ctfs.filter((c) => !c.is_upcoming).slice(0, 3).map((ctf, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          key={ctf.id} 
                          className="card p-5 flex flex-col justify-between text-left cursor-default"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-red)] bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 px-1.5 py-0.5 rounded">
                                PLACEMENT #{ctf.placement}
                              </span>
                              <span className="font-mono text-[10px] text-[var(--text-dim)] font-bold">{ctf.date}</span>
                            </div>
                            <h3 className="text-card-title text-[var(--text-primary)] mb-2">
                              {ctf.name}
                            </h3>
                            <p className="text-body text-xs mb-4">
                              {ctf.description}
                            </p>
                          </div>
                          <div className="border-t border-[var(--border-default)] pt-3 flex justify-between items-center text-xs font-mono">
                            <span className="text-[var(--text-dim)]">TEAMS: {ctf.total_teams}</span>
                            <span className="text-[var(--text-green)] font-bold">{ctf.team_score} PTS</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  <SectionDivider />

                  {/* Latest Writeups (3 Cards) & Blogs (2 Cards) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                  >
                    {/* Latest Writeups */}
                    <div className="lg:col-span-3 space-y-6 text-left">
                      <div className="flex justify-between items-end border-b border-[var(--border-default)] pb-2">
                        <h2 className="text-section-title text-[var(--text-primary)]">
                          LATEST DISPATCH EXPLOITS
                        </h2>
                        <button
                          onClick={() => setCurrentView("writeups")}
                          className="font-mono text-xs text-[var(--text-red)] hover:text-[var(--text-primary)] uppercase font-bold transition-colors"
                        >
                          ALL WRITEUPS
                        </button>
                      </div>

                      <div className="space-y-4">
                        {writeups.slice(0, 3).map((w, idx) => {
                          const author = members.find((m) => m.id === w.author_id);
                          return (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: idx * 0.1 }}
                              key={w.id}
                              onClick={() => readWriteup(w)}
                              className="card p-4 cursor-pointer flex flex-col justify-between"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-[9px] uppercase font-bold bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 text-[var(--text-red)] px-1.5 py-0.5 rounded">
                                  {w.category}
                               </span>
                                <span className="font-mono text-[10px] text-[var(--text-dim)]">{w.published_at}</span>
                              </div>
                              <h3 className="text-card-title text-[var(--text-primary)] hover:text-[var(--text-red)] transition-colors mb-1">
                                {w.title}
                              </h3>
                              <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-secondary)] mt-2">
                                <span>SOLVED_BY: {author ? author.name.split(" '")[0] : "HUNTER_N/A"}</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-[var(--text-red)]" /> {w.views} READS
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Editorial Blogs */}
                    <div className="lg:col-span-2 space-y-6 text-left">
                      <div className="flex justify-between items-end border-b border-[var(--border-default)] pb-2">
                        <h2 className="text-section-title text-[var(--text-primary)]">
                          TACTICAL JOURNAL
                        </h2>
                        <button
                          onClick={() => setCurrentView("blog")}
                          className="font-mono text-xs text-[var(--text-red)] hover:text-[var(--text-primary)] uppercase font-bold transition-colors"
                        >
                          ALL POSTS
                        </button>
                      </div>

                      <div className="space-y-4">
                        {blogs.slice(0, 2).map((b, idx) => (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            key={b.id}
                            onClick={() => { setSelectedBlogPost(b); }}
                            className="card cursor-pointer overflow-hidden flex flex-col justify-between"
                          >
                            <img
                              src={b.cover_image_url}
                              alt={b.title}
                              className="w-full h-32 object-cover border-b border-[var(--border-default)]"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-4">
                              <span className="font-mono text-[9px] text-[var(--text-dim)] block mb-1 font-bold uppercase">{b.published_at}</span>
                              <h3 className="text-card-title text-[var(--text-primary)] line-clamp-2 hover:text-[var(--text-red)] transition-colors">
                                {b.title}
                              </h3>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <SectionDivider />

                  {/* Team Preview Section */}
                  <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-section-title text-[var(--text-primary)]">
                        OUR COMMANDING COUNCILS
                      </h2>
                      <p className="text-label mt-1">
                        Elite hackers heading tactical cyber cells
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {members.slice(0, 3).map((m, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          key={m.id}
                          className="member-card-wrapper cursor-pointer"
                          onClick={() => setSelectedTeamMember(m)}
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <img
                              src={m.avatar_url}
                              alt={m.name}
                              className="member-avatar"
                              referrerPolicy="no-referrer"
                            />
                            <div className="member-handle">@{m.id}</div>
                            <h3 className="member-name">{m.name}</h3>
                            <div className="member-role mb-3">{m.role}</div>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4">
                              {m.bio}
                            </p>
                            <div>
                              {m.skills?.slice(0,3).map((sk) => (
                                <span key={sk} className="skill-pill">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  <SectionDivider />

                  {/* Join Section Elite CTA */}
                  <motion.section 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="border border-[var(--border-red)] bg-[var(--red-core)]/5 p-8 relative overflow-hidden text-center flex flex-col items-center justify-center mb-4"
                  >
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--red-core)]" />
                    <h2 className="text-section-title text-[var(--text-primary)] mb-2">
                      THINK YOU'RE READY TO JOIN?
                    </h2>
                    <p className="text-label text-[var(--text-secondary)] max-w-lg mb-6">
                      Our ranks are reserved for operators who respect heap discipline and decrypt whiteboxes. Prove your worth below.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentView("apply");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="btn-join active:scale-95 transition-transform"
                    >
                      SUBMIT COMMISSION REQUEST
                    </button>
                  </motion.section>

                </div>
              )}

              {/* VIEW: CTFS HISTORY */}
              {currentView === "ctfs" && (
                <div className="space-y-8 text-left">
                  <header className="border-b border-[var(--border-default)] pb-4">
                    <h1 className="text-section-title text-[var(--text-primary)]">
                      OPERATIONAL CTF HISTORY
                    </h1>
                    <p className="text-label mt-1">
                      Archive of team placements, scores, and active cyber conflicts
                    </p>
                  </header>

                  {/* Filters Year */}
                  <div className="flex border-b border-[var(--border-default)] pb-1 font-mono text-xs gap-1 select-none overflow-x-auto">
                    {["ALL", "2026", "UPCOMING"].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setCtfFilterYear(yr)}
                        className={`px-4 py-2 border-b-2 font-bold uppercase transition-colors ${
                          ctfFilterYear === yr ? "border-[var(--red-core)] text-[var(--red-core)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ctfs
                      .filter((c) => {
                        if (ctfFilterYear === "ALL") return true;
                        if (ctfFilterYear === "UPCOMING") return c.is_upcoming;
                        return c.date.includes(ctfFilterYear) && !c.is_upcoming;
                      })
                      .map((ctf) => (
                        <div key={ctf.id} className="card p-6 flex flex-col justify-between text-left cursor-default">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`font-mono text-[10px] uppercase font-bold border px-2 py-0.5 rounded ${
                                ctf.is_upcoming
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse"
                                  : "bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 text-[var(--red-core)]"
                              }`}>
                                {ctf.is_upcoming ? "STAGED MISSION" : `PLACEMENT #${ctf.placement}`}
                              </span>
                              <span className="font-mono text-[11px] text-[var(--text-dim)] font-bold">{ctf.date}</span>
                            </div>

                            <h3 className="text-card-title text-[var(--text-primary)] mb-2">
                              {ctf.name}
                            </h3>
                            <p className="text-body text-xs mb-4">
                              {ctf.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {ctf.tags?.map((t) => (
                                <span key={t} className="skill-pill">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-[var(--border-default)] pt-3 flex justify-between items-center text-xs font-mono">
                            <span className="text-[var(--text-dim)]">ORGANIZER: {ctf.organizer}</span>
                            <span className="text-[var(--text-green)] font-bold">
                              {ctf.is_upcoming ? "TBD" : `${ctf.team_score} PTS`}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* VIEW: WRITEUPS INDEX */}
              {currentView === "writeups" && (
                <div className="space-y-8 text-left">
                  <header className="border-b border-[var(--border-default)] pb-4">
                    <h1 className="text-section-title text-[var(--text-primary)]">
                      EXPLOIT WRITEUP DATABASE
                    </h1>
                    <p className="text-label mt-1">
                      Detailed proof-of-concept shellcodes and memory analysis files
                    </p>
                  </header>

                  {/* Filters Category */}
                  <div className="flex flex-wrap border-b border-[var(--border-default)] pb-2 gap-1.5 text-xs font-mono select-none">
                    {["ALL", "Web", "Reverse", "OSINT", "Forensics", "Crypto", "PWN"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setWriteupCategory(cat)}
                        className={`px-3 py-1.5 border rounded uppercase font-bold transition-all ${
                          writeupCategory === cat
                            ? "border-[var(--red-core)] bg-[var(--red-core)]/10 text-[var(--red-core)]"
                            : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {cat === "ALL" ? "ALL CATEGORIES" : cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {writeups
                      .filter((w) => {
                        if (writeupCategory === "ALL") return true;
                        return w.category.toLowerCase() === writeupCategory.toLowerCase();
                      })
                      .map((writeup) => {
                        const author = members.find((m) => m.id === writeup.author_id);
                        return (
                          <div
                            key={writeup.id}
                            onClick={() => readWriteup(writeup)}
                            className="card p-5 cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-mono text-[9px] uppercase font-bold bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 text-[var(--red-core)] px-1.5 py-0.5 rounded">
                                  {writeup.category}
                                </span>
                                <span className="font-mono text-[10px] text-[var(--text-dim)]">{writeup.published_at}</span>
                              </div>

                              <h3 className="text-card-title text-[var(--text-primary)] hover:text-[var(--text-red)] transition-colors mb-2 line-clamp-2">
                                {writeup.title}
                              </h3>

                              <p className="text-body text-xs line-clamp-2 mb-4">
                                {writeup.content.replace(/#|\*|`/g, "")}
                              </p>
                            </div>

                            <div className="border-t border-[var(--border-default)] pt-3 flex justify-between items-center text-[10px] font-mono text-[var(--text-secondary)]">
                              <span>SOLVED_BY: {author ? author.name.split(" '")[0] : "HUNTER_N/A"}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-[var(--text-red)]" /> {writeup.views} READS
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* VIEW: WRITEUP DETAIL READER */}
              {currentView === "writeup-detail" && selectedWriteup && (
                <WriteupReader
                  writeup={selectedWriteup}
                  author={members.find((m) => m.id === selectedWriteup.author_id)}
                  ctfEvent={ctfs.find((c) => c.id === selectedWriteup.ctf_event_id)}
                  onBack={() => setCurrentView("writeups")}
                />
              )}

              {/* VIEW: BLOG INDEX */}
              {currentView === "blog" && (
                <div className="space-y-8 text-left">
                  <header className="border-b border-[var(--border-default)] pb-4">
                    <h1 className="text-section-title text-[var(--text-primary)]">
                      TACTICAL JOURNAL & DISPATCHES
                    </h1>
                    <p className="text-label mt-1">
                      Weekly security briefs, threat intelligence reports, and command updates
                    </p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.filter(b => b.status === "published").map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedBlogPost(post)}
                        className="card cursor-pointer overflow-hidden flex flex-col justify-between"
                      >
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover border-b border-[var(--border-default)]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-5 text-left">
                          <span className="font-mono text-[10px] text-[var(--text-dim)] block mb-1 font-bold uppercase">
                            {post.published_at}
                          </span>
                          <h3 className="text-card-title text-[var(--text-primary)] hover:text-[var(--text-red)] transition-colors mb-3">
                            {post.title}
                          </h3>
                          <p className="text-body text-xs line-clamp-3">
                            {post.content.replace(/#|\*|`/g, "")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: TEAM LIST */}
              {currentView === "team" && (
                <div className="space-y-8 text-left">
                  <header className="border-b border-[var(--border-default)] pb-4">
                    <h1 className="text-section-title text-[var(--text-primary)]">
                      HUNTER CADRES & DIVISION COUNCILS
                    </h1>
                    <p className="text-label mt-1">
                      Operational directory of our squad commanders and researchers
                    </p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="member-card-wrapper cursor-pointer"
                        onClick={() => setSelectedTeamMember(member)}
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="member-avatar"
                            referrerPolicy="no-referrer"
                          />
                          <div className="member-handle">@{member.id}</div>
                          <h3 className="member-name">{member.name}</h3>
                          <div className="member-role mb-3">{member.role}</div>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4">
                            {member.bio}
                          </p>
                          <div>
                            {member.skills?.slice(0,4).map((sk) => (
                              <span key={sk} className="skill-pill">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: APPLY JOIN FORM */}
              {currentView === "apply" && (
                <JoinForm onSuccess={() => setCurrentView("home")} />
              )}

              {/* VIEW: ADMIN PANEL */}
              {currentView === "admin" && (
                <div>
                  {adminToken ? (
                    <AdminPanel onLogout={handleAdminLogout} />
                  ) : (
                    // Admin Password login gate
                    <div className="max-w-md mx-auto border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 relative mt-12 text-left">
                      <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
                      <div className="flex items-center gap-2 mb-4 text-[var(--red-core)] font-bold uppercase font-heading text-lg border-b border-[var(--border-default)] pb-2">
                        <Lock className="w-5 h-5" /> TACTICAL AUTHENTICATION GATE
                      </div>

                      {loginError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono p-3 rounded mb-4">
                          {loginError}
                        </div>
                      )}

                      <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[var(--text-secondary)] uppercase font-bold">Admin Email Callsign *</label>
                          <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin@devilhunters.io"
                            className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[var(--text-secondary)] uppercase font-bold">Encrypted Command Passcode *</label>
                          <input
                            type="password"
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none"
                          />
                        </div>

                        {/* Helper credentials display to improve developer user flow */}
                        <div className="p-3 bg-[var(--border-default)]/25 border border-[var(--border-default)] rounded text-[var(--text-dim)] text-[10px] leading-normal uppercase">
                          <span className="text-[var(--text-secondary)] font-semibold">CADRE DEMO ACCESS:</span>
                          <div className="mt-1">EMAIL: <span className="text-[var(--text-primary)]">admin@devilhunters.io</span></div>
                          <div>PASSCODE: <span className="text-[var(--text-primary)]">hunter_admin_2026</span></div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-white font-bold uppercase rounded tracking-wider transition-colors mt-2"
                        >
                          COMMENCE DEPLOYMENT
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>

          {/* Footer branding */}
          <footer className="footer mt-12">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="footer-left">
                © 2026 DEVIL HUNTERS DIVISION. ALL EXPLOITS PROTECTED BY HEAP SECURITY INC.
              </span>
              <div className="footer-right">
                <button onClick={() => setCurrentView("admin")} className="font-mono text-[10px] text-[var(--text-dim)] hover:text-[var(--text-primary)] uppercase font-bold tracking-wider transition-colors">
                  ADMIN OPS
                </button>
                <div className="footer-status">
                  <div className="status-dot"></div>
                  SYS_STATUS: NOMINAL
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* TEAM MEMBER DETAIL MODAL */}
      <AnimatePresence>
        {selectedTeamMember && (
          <div className="fixed inset-0 bg-[var(--bg-void)]/90 z-50 flex items-center justify-center p-4">
            <div className="scanlines" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 max-w-lg w-full relative text-left"
            >
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--red-core)]" />
              
              <button
                onClick={() => setSelectedTeamMember(null)}
                className="absolute top-4 right-4 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--red-core)] uppercase font-bold"
              >
                [CLOSE]
              </button>

              <div className="flex items-center gap-4 border-b border-[var(--border-default)] pb-4 mb-4 mt-2">
                <img
                  src={selectedTeamMember.avatar_url}
                  alt={selectedTeamMember.name}
                  className="w-14 h-14 rounded-full border border-[var(--red-core)] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] uppercase tracking-wide">
                    {selectedTeamMember.name}
                  </h3>
                  <span className="font-mono text-xs text-[var(--red-core)] font-bold">{selectedTeamMember.role}</span>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="text-[var(--text-dim)] text-[10px] uppercase block mb-1">TACTICAL BIO</span>
                  <p className="text-[var(--text-primary)] leading-relaxed font-sans text-sm">{selectedTeamMember.bio}</p>
                </div>

                <div>
                  <span className="text-[var(--text-dim)] text-[10px] uppercase block mb-1">MEM_BLOCK SKILLS</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedTeamMember.skills?.map((sk) => (
                      <span key={sk} className="bg-[var(--border-default)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--border-default)]/50 pt-3.5 flex justify-between items-center">
                  <span className="text-[var(--text-dim)]">JOINED: {selectedTeamMember.joined_at}</span>
                  {selectedTeamMember.social_links?.github && (
                    <a
                      href={`https://github.com/${selectedTeamMember.social_links.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--text-primary)] hover:text-[var(--red-core)] flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Github className="w-4 h-4" /> <span>GITHUB</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BLOG POST READ MODAL */}
      <AnimatePresence>
        {selectedBlogPost && (
          <div className="fixed inset-0 bg-[var(--bg-void)]/90 z-50 flex items-center justify-center p-4">
            <div className="scanlines" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-0 max-w-2xl w-full relative text-left overflow-y-auto max-h-[90vh]"
            >
              <img
                src={selectedBlogPost.cover_image_url}
                alt={selectedBlogPost.title}
                className="w-full h-48 object-cover border-b border-[var(--border-default)]"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedBlogPost(null)}
                className="absolute top-4 right-4 font-mono text-xs text-white bg-black/60 px-2 py-1 rounded border border-white/20 hover:text-[var(--red-core)] uppercase font-bold"
              >
                [CLOSE]
              </button>

              <div className="p-6 md:p-8 space-y-4">
                <span className="font-mono text-[10px] text-[var(--red-core)] uppercase font-bold block">{selectedBlogPost.published_at}</span>
                <h3 className="font-heading font-bold text-2xl text-[var(--text-primary)] leading-tight uppercase tracking-wide border-b border-[var(--border-default)] pb-3 mb-4">
                  {selectedBlogPost.title}
                </h3>
                <div className="prose prose-invert max-w-none text-sm text-[var(--text-secondary)] leading-relaxed space-y-4 whitespace-pre-wrap">
                  {selectedBlogPost.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
