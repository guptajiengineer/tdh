import React, { useState, useEffect } from "react";
import {
  Terminal, Shield, Users, Trophy, BookOpen, AlertCircle, Settings,
  LogOut, Plus, Trash2, Edit3, Check, X, FileText, LayoutGrid, Calendar, HelpCircle
} from "lucide-react";
import { Member, CTFEvent, Writeup, BlogPost, Application, SiteSetting } from "../types";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  // State from server DB
  const [members, setMembers] = useState<Member[]>([]);
  const [ctfs, setCtfs] = useState<CTFEvent[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Navigation tab inside admin
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "ctfs" | "writeups" | "blog" | "members" | "applications" | "settings"
  >("dashboard");

  // Selected item for detail view / editing
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Form states for adding / editing items
  const [editingItemType, setEditingItemType] = useState<string | null>(null); // e.g. "ctf", "writeup", "blog", "member"
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // null means adding new

  // Generic forms state
  const [ctfForm, setCtfForm] = useState<Partial<CTFEvent>>({});
  const [writeupForm, setWriteupForm] = useState<Partial<Writeup>>({});
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({});
  const [memberForm, setMemberForm] = useState<Partial<Member>>({});

  // Fetch full DB state
  const fetchState = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setCtfs(data.ctf_events || []);
        setWriteups(data.writeups || []);
        setBlogs(data.blog_posts || []);
        setApplications(data.applications || []);
        setSettings(data.settings || {});
      }
    } catch (e) {
      console.error("Failed to load db state", e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Generic API request handler
  const apiReq = async (url: string, method: string, body?: any) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      if (res.ok) {
        fetchState();
        return true;
      }
    } catch (e) {
      console.error(`Error requesting ${method} ${url}`, e);
    }
    return false;
  };

  // Applications Accept/Reject actions
  const handleAppStatus = async (appId: string, status: "accepted" | "rejected") => {
    const success = await apiReq(`/api/applications/${appId}`, "PUT", { status });
    if (success) {
      const updatedApp = applications.find((a) => a.id === appId);
      if (updatedApp) {
        setSelectedApplication({ ...updatedApp, status });

        // Auto-create member if accepted
        if (status === "accepted") {
          const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
          const skillsList = updatedApp.skills || [];
          await apiReq("/api/members", "POST", {
            name: updatedApp.name,
            role: "Member",
            avatar_url: defaultAvatar,
            bio: `Accepted recruit. Experience: ${updatedApp.experience_text}`,
            skills: skillsList,
            social_links: { github: updatedApp.github },
            is_active: true
          });
        }
      }
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiReq("/api/settings", "POST", settings);
    alert("SYSTEM CONFIRMATION: CMS Global Settings Updated.");
  };

  // CTF CRUD
  const saveCtf = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingItemId;
    const url = isEdit ? `/api/ctfs/${editingItemId}` : "/api/ctfs";
    const method = isEdit ? "PUT" : "POST";
    const success = await apiReq(url, method, {
      ...ctfForm,
      placement: Number(ctfForm.placement),
      team_score: Number(ctfForm.team_score),
      total_teams: Number(ctfForm.total_teams),
      tags: typeof ctfForm.tags === "string" ? (ctfForm.tags as string).split(",").map(t => t.trim()) : ctfForm.tags || []
    });
    if (success) {
      setEditingItemType(null);
      setEditingItemId(null);
    }
  };

  // Writeup CRUD
  const saveWriteup = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingItemId;
    const url = isEdit ? `/api/writeups/${editingItemId}` : "/api/writeups";
    const method = isEdit ? "PUT" : "POST";
    const success = await apiReq(url, method, {
      ...writeupForm,
      tags: typeof writeupForm.tags === "string" ? (writeupForm.tags as string).split(",").map(t => t.trim()) : writeupForm.tags || []
    });
    if (success) {
      setEditingItemType(null);
      setEditingItemId(null);
    }
  };

  // Blog CRUD
  const saveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingItemId;
    const url = isEdit ? `/api/blog/${editingItemId}` : "/api/blog";
    const method = isEdit ? "PUT" : "POST";
    const success = await apiReq(url, method, {
      ...blogForm,
      tags: typeof blogForm.tags === "string" ? (blogForm.tags as string).split(",").map(t => t.trim()) : blogForm.tags || []
    });
    if (success) {
      setEditingItemType(null);
      setEditingItemId(null);
    }
  };

  // Member CRUD
  const saveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingItemId;
    const url = isEdit ? `/api/members/${editingItemId}` : "/api/members";
    const method = isEdit ? "PUT" : "POST";
    const success = await apiReq(url, method, {
      ...memberForm,
      skills: typeof memberForm.skills === "string" ? (memberForm.skills as string).split(",").map(s => s.trim()) : memberForm.skills || []
    });
    if (success) {
      setEditingItemType(null);
      setEditingItemId(null);
    }
  };

  // Open edit states
  const initCtfEdit = (ctf?: CTFEvent) => {
    if (ctf) {
      setCtfForm({ ...ctf, tags: ctf.tags?.join(", ") as any });
      setEditingItemId(ctf.id);
    } else {
      setCtfForm({ name: "", organizer: "", date: new Date().toISOString().split('T')[0], placement: 1, team_score: 0, total_teams: 100, tags: "Pwn, Web" as any, description: "", is_upcoming: false });
      setEditingItemId(null);
    }
    setEditingItemType("ctf");
  };

  const initWriteupEdit = (w?: Writeup) => {
    if (w) {
      setWriteupForm({ ...w, tags: w.tags?.join(", ") as any });
      setEditingItemId(w.id);
    } else {
      setWriteupForm({
        title: "",
        ctf_event_id: ctfs[0]?.id || "",
        author_id: members[0]?.id || "",
        category: "Web",
        difficulty: "Medium",
        content: `# TITLE OF EXPLOIT\n\n## Vulnerability Overview\nDescribe here...\n\n## Steps to reproduce\n\`\`\`bash\n# exploit payload\n\`\`\``,
        tags: "Exploit, POC" as any
      });
      setEditingItemId(null);
    }
    setEditingItemType("writeup");
  };

  const initBlogEdit = (b?: BlogPost) => {
    if (b) {
      setBlogForm({ ...b, tags: b.tags?.join(", ") as any });
      setEditingItemId(b.id);
    } else {
      setBlogForm({
        title: "",
        author_id: members[0]?.id || "",
        cover_image_url: "https://picsum.photos/seed/cyber/800/400",
        content: `Write blog post details here...`,
        status: "draft",
        tags: "News, Research" as any
      });
      setEditingItemId(null);
    }
    setEditingItemType("blog");
  };

  const initMemberEdit = (m?: Member) => {
    if (m) {
      setMemberForm({ ...m, skills: m.skills?.join(", ") as any });
      setEditingItemId(m.id);
    } else {
      setMemberForm({
        name: "",
        role: "Member",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "",
        skills: "Pwn, Crypto" as any,
        social_links: { github: "" },
        is_active: true
      });
      setEditingItemId(null);
    }
    setEditingItemType("member");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] flex flex-col md:flex-row relative">
      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Admin Navigation Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-default)] flex flex-col">
        <div className="p-6 border-b border-[var(--border-default)] flex items-center gap-2.5">
          <span className="w-3 h-3 bg-[var(--red-core)] rounded-full animate-ping" />
          <div className="text-left">
            <h1 className="font-heading font-bold text-lg text-[var(--text-primary)] uppercase tracking-wider">
              WAR ROOM OPS
            </h1>
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase">
              LEVEL: SYSTEM ADMIN
            </span>
          </div>
        </div>

        {/* Sidebar Nav buttons */}
        <nav className="p-4 flex-1 flex flex-col gap-1 select-none">
          <button
            onClick={() => { setActiveTab("dashboard"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "dashboard" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>OPS DASHBOARD</span>
          </button>

          <button
            onClick={() => { setActiveTab("ctfs"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "ctfs" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>CTF EVENTS ({ctfs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("writeups"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "writeups" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>EXPLOIT WRITEUPS ({writeups.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("blog"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "blog" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>EDITORIAL BLOG ({blogs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("members"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "members" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>HUNTER CADRES ({members.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("applications"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all relative ${
              activeTab === "applications" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RECRUITMENT APPS</span>
            {applications.filter((a) => a.status === "pending").length > 0 && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[var(--red-core)] border border-white/20 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {applications.filter((a) => a.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("settings"); setEditingItemType(null); }}
            className={`w-full px-3.5 py-2.5 rounded font-mono text-xs font-semibold text-left uppercase flex items-center gap-2.5 transition-all ${
              activeTab === "settings" ? "bg-[var(--red-core)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/30"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>AI RULES & CMS</span>
          </button>
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-void)]/50">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 text-xs font-mono font-bold text-left text-[var(--red-glow)] hover:bg-[var(--red-core)]/10 rounded flex items-center gap-2 transition-colors uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen text-left relative z-10">
        {/* Editing Item Overlay/Form View */}
        {editingItemType ? (
          <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 max-w-4xl mx-auto shadow-2xl relative">
            <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
            <h2 className="font-heading font-semibold text-xl text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-default)] pb-3 mb-6">
              {editingItemId ? `MODIFYING ${editingItemType.toUpperCase()} DATA` : `ADDING NEW ${editingItemType.toUpperCase()} ELEMENT`}
            </h2>

            {/* CTF Event Form */}
            {editingItemType === "ctf" && (
              <form onSubmit={saveCtf} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">CTF Event Name *</label>
                    <input
                      type="text"
                      required
                      value={ctfForm.name || ""}
                      onChange={(e) => setCtfForm({ ...ctfForm, name: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Organizer *</label>
                    <input
                      type="text"
                      required
                      value={ctfForm.organizer || ""}
                      onChange={(e) => setCtfForm({ ...ctfForm, organizer: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Date *</label>
                    <input
                      type="date"
                      required
                      value={ctfForm.date || ""}
                      onChange={(e) => setCtfForm({ ...ctfForm, date: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Placement Score (0 for upcoming) *</label>
                    <input
                      type="number"
                      required
                      value={ctfForm.placement || 0}
                      onChange={(e) => setCtfForm({ ...ctfForm, placement: Number(e.target.value) })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Team Score *</label>
                    <input
                      type="number"
                      required
                      value={ctfForm.team_score || 0}
                      onChange={(e) => setCtfForm({ ...ctfForm, team_score: Number(e.target.value) })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Total Teams *</label>
                    <input
                      type="number"
                      required
                      value={ctfForm.total_teams || 100}
                      onChange={(e) => setCtfForm({ ...ctfForm, total_teams: Number(e.target.value) })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Tags (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    value={ctfForm.tags as any || ""}
                    onChange={(e) => setCtfForm({ ...ctfForm, tags: e.target.value as any })}
                    placeholder="Pwn, Web, Sandbox, Reversing"
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Description / Overview *</label>
                  <textarea
                    required
                    rows={4}
                    value={ctfForm.description || ""}
                    onChange={(e) => setCtfForm({ ...ctfForm, description: e.target.value })}
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_upcoming"
                    checked={ctfForm.is_upcoming || false}
                    onChange={(e) => setCtfForm({ ...ctfForm, is_upcoming: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_upcoming" className="font-mono text-xs text-[var(--text-primary)] uppercase select-none">
                    Is Upcoming Event (TBD score/placements)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEditingItemType(null)}
                    className="px-4 py-2 bg-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded uppercase"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white rounded uppercase"
                  >
                    DEPLOY TO SYSTEM
                  </button>
                </div>
              </form>
            )}

            {/* Writeup Form with elegant Markdown editor and dual live preview */}
            {editingItemType === "writeup" && (
              <form onSubmit={saveWriteup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Writeup Title *</label>
                    <input
                      type="text"
                      required
                      value={writeupForm.title || ""}
                      onChange={(e) => setWriteupForm({ ...writeupForm, title: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">CTF Event Reference *</label>
                    <select
                      required
                      value={writeupForm.ctf_event_id || ""}
                      onChange={(e) => setWriteupForm({ ...writeupForm, ctf_event_id: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      {ctfs.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Author Code Signature *</label>
                    <select
                      required
                      value={writeupForm.author_id || ""}
                      onChange={(e) => setWriteupForm({ ...writeupForm, author_id: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Category Domain *</label>
                    <select
                      required
                      value={writeupForm.category || "Web"}
                      onChange={(e) => setWriteupForm({ ...writeupForm, category: e.target.value as any })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      <option value="Web">Web Exploitation</option>
                      <option value="Reverse">Reverse Engineering</option>
                      <option value="OSINT">OSINT</option>
                      <option value="Forensics">Forensics</option>
                      <option value="Crypto">Cryptography</option>
                      <option value="PWN">PWN</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Difficulty Tier *</label>
                    <select
                      required
                      value={writeupForm.difficulty || "Medium"}
                      onChange={(e) => setWriteupForm({ ...writeupForm, difficulty: e.target.value as any })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Insane">Insane</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Tags (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={writeupForm.tags as any || ""}
                      onChange={(e) => setWriteupForm({ ...writeupForm, tags: e.target.value as any })}
                      placeholder="Exploit, JIT, Heap"
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Markdown Exploit Content *</label>
                    <span className="font-mono text-[10px] text-[var(--red-core)] uppercase">TACTICAL EDITOR</span>
                  </div>
                  <textarea
                    required
                    rows={12}
                    value={writeupForm.content || ""}
                    onChange={(e) => setWriteupForm({ ...writeupForm, content: e.target.value })}
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded p-3 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEditingItemType(null)}
                    className="px-4 py-2 bg-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded uppercase"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white rounded uppercase"
                  >
                    PUBLISH DECRYPT
                  </button>
                </div>
              </form>
            )}

            {/* Blog Post Form */}
            {editingItemType === "blog" && (
              <form onSubmit={saveBlog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Blog Title *</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title || ""}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Author *</label>
                    <select
                      required
                      value={blogForm.author_id || ""}
                      onChange={(e) => setBlogForm({ ...blogForm, author_id: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Cover Image CDN URL *</label>
                    <input
                      type="text"
                      required
                      value={blogForm.cover_image_url || ""}
                      onChange={(e) => setBlogForm({ ...blogForm, cover_image_url: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Tags (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={blogForm.tags as any || ""}
                      onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value as any })}
                      placeholder="Security, Research, Linux"
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Publication Status *</label>
                    <select
                      required
                      value={blogForm.status || "draft"}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Public)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Blog Content *</label>
                  <textarea
                    required
                    rows={12}
                    value={blogForm.content || ""}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded p-3 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEditingItemType(null)}
                    className="px-4 py-2 bg-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded uppercase"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white rounded uppercase"
                  >
                    SAVE DISPATCH
                  </button>
                </div>
              </form>
            )}

            {/* Member Form */}
            {editingItemType === "member" && (
              <form onSubmit={saveMember} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Full Name / Callsign *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.name || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Squad Position *</label>
                    <select
                      required
                      value={memberForm.role || "Member"}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as any })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    >
                      <option value="Captain">Squad Captain</option>
                      <option value="Member">Regular Cadre Member</option>
                      <option value="Alumni">Retired Alumni</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Avatar Profile Image Link *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.avatar_url || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, avatar_url: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Operational Specializations (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.skills as any || ""}
                      onChange={(e) => setMemberForm({ ...memberForm, skills: e.target.value as any })}
                      placeholder="Pwn, OSINT, Reverse"
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">GitHub Username</label>
                  <input
                    type="text"
                    value={memberForm.social_links?.github || ""}
                    onChange={(e) => setMemberForm({
                      ...memberForm,
                      social_links: { ...memberForm.social_links, github: e.target.value }
                    })}
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">Tactical Bio / Code Record *</label>
                  <textarea
                    required
                    rows={4}
                    value={memberForm.bio || ""}
                    onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                    className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={memberForm.is_active || false}
                    onChange={(e) => setMemberForm({ ...memberForm, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="font-mono text-xs text-[var(--text-primary)] uppercase select-none">
                    Currently Deployed in Active Missions
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEditingItemType(null)}
                    className="px-4 py-2 bg-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded uppercase"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white rounded uppercase"
                  >
                    REGISTER HUNTER
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          // Dynamic Tab Views
          <div>
            {/* Dashboard View */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
                  <h2 className="font-heading font-bold text-2xl text-[var(--text-primary)] tracking-wide uppercase mb-1">
                    WELCOME BACK COMMANDER
                  </h2>
                  <p className="font-mono text-xs text-[var(--text-secondary)] uppercase">
                    SYSTEMS BOOTED: STABLE // ALL COGNITIVE CHANNELS DEPLOYED
                  </p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
                    <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase">PENDING APPLICANTS</span>
                    <div className="font-heading font-bold text-3xl text-[var(--red-core)] mt-1">
                      {applications.filter((a) => a.status === "pending").length}
                    </div>
                  </div>

                  <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
                    <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase">ACTIVE OPERATIONS</span>
                    <div className="font-heading font-bold text-3xl text-[var(--text-green)] mt-1">
                      {ctfs.filter((c) => !c.is_upcoming).length}
                    </div>
                  </div>

                  <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
                    <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase">TOTAL DECRYPT WRITEUPS</span>
                    <div className="font-heading font-bold text-3xl text-[var(--text-primary)] mt-1">
                      {writeups.length}
                    </div>
                  </div>

                  <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
                    <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase">MEMBERS ENROLLED</span>
                    <div className="font-heading font-bold text-3xl text-[var(--text-primary)] mt-1">
                      {members.length}
                    </div>
                  </div>
                </div>

                {/* System Activity Stream */}
                <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-left">
                  <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)] uppercase tracking-wider mb-4">
                    RECENT TACTICAL ACTIVITY LOGS
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex gap-4 border-b border-[var(--border-default)]/30 pb-2.5">
                      <span className="text-[var(--red-core)] shrink-0">[JULY 04]</span>
                      <span className="text-[var(--text-primary)]">Admin console mounted on port 3000 securely. Seed registers loaded cleanly.</span>
                    </div>
                    <div className="flex gap-4 border-b border-[var(--border-default)]/30 pb-2.5">
                      <span className="text-[var(--red-core)] shrink-0">[JUNE 25]</span>
                      <span className="text-[var(--text-primary)]">Writeup published by Phreak Tanaka regarding Google CTF heap exploit.</span>
                    </div>
                    <div className="flex gap-4 border-b border-[var(--border-default)]/30 pb-2.5">
                      <span className="text-[var(--text-dim)] shrink-0">[SYSTEM]</span>
                      <span className="text-[var(--text-secondary)]">Automated cleanup daemon executed. Removed 0 dead bytes. Heap size: 1.04MB.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTF Tab */}
            {activeTab === "ctfs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-heading font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">
                    OPERATIONAL CTF HISTORY
                  </h2>
                  <button
                    onClick={() => initCtfEdit()}
                    className="px-3 py-1.5 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white uppercase rounded flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> ADD EVENT
                  </button>
                </div>

                <div className="overflow-x-auto border border-[var(--border-default)]">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                        <th className="p-3">EVENT NAME</th>
                        <th className="p-3">ORGANIZER</th>
                        <th className="p-3">DATE</th>
                        <th className="p-3">PLACEMENT</th>
                        <th className="p-3">SCORE</th>
                        <th className="p-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]/50">
                      {ctfs.map((c) => (
                        <tr key={c.id} className="hover:bg-[var(--border-default)]/20 text-[var(--text-primary)]">
                          <td className="p-3 font-semibold text-[var(--text-primary)]">{c.name}</td>
                          <td className="p-3 text-[var(--text-secondary)]">{c.organizer}</td>
                          <td className="p-3">{c.date}</td>
                          <td className="p-3">
                            {c.is_upcoming ? (
                              <span className="text-[var(--text-amber)] font-semibold uppercase">UPCOMING</span>
                            ) : (
                              <span className="font-bold text-[var(--red-glow)]">#{c.placement}</span>
                            )}
                          </td>
                          <td className="p-3">{c.is_upcoming ? "TBD" : `${c.team_score} pts`}</td>
                          <td className="p-3 text-right flex justify-end gap-2">
                            <button
                              onClick={() => initCtfEdit(c)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/50 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => apiReq(`/api/ctfs/${c.id}`, "DELETE")}
                              className="p-1.5 text-[var(--red-core)] hover:text-[var(--red-glow)] hover:bg-[var(--border-default)]/50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Writeups Tab */}
            {activeTab === "writeups" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-heading font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">
                    EXPLOIT WRITEUP DATABASE
                  </h2>
                  <button
                    onClick={() => initWriteupEdit()}
                    className="px-3 py-1.5 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white uppercase rounded flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> NEW WRITEUP
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {writeups.map((w) => (
                    <div key={w.id} className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-[var(--red-core)] bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 px-1.5 py-0.5 rounded">
                            {w.category}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--text-dim)]">{w.published_at}</span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-[var(--text-primary)] mb-2">{w.title}</h3>
                        <p className="font-mono text-xs text-[var(--text-secondary)] line-clamp-2 mb-4">
                          {w.content.substring(0, 150).replace(/#|\*|`/g, "")}...
                        </p>
                      </div>

                      <div className="border-t border-[var(--border-default)]/40 pt-3 flex justify-between items-center">
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">SOLVES: {w.views}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => initWriteupEdit(w)}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/50 rounded"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => apiReq(`/api/writeups/${w.id}`, "DELETE")}
                            className="p-1.5 text-[var(--red-core)] hover:text-[var(--red-glow)] hover:bg-[var(--border-default)]/50 rounded"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Tab */}
            {activeTab === "blog" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-heading font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">
                    EDITORIAL SYSTEM
                  </h2>
                  <button
                    onClick={() => initBlogEdit()}
                    className="px-3 py-1.5 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white uppercase rounded flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> NEW POST
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogs.map((b) => (
                    <div key={b.id} className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            b.status === "published" ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-[var(--border-default)] text-[var(--text-secondary)]"
                          }`}>
                            {b.status}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--text-dim)]">{b.published_at}</span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-[var(--text-primary)] mb-2">{b.title}</h3>
                      </div>

                      <div className="border-t border-[var(--border-default)]/40 pt-3 flex justify-end gap-1.5 mt-4">
                        <button
                          onClick={() => initBlogEdit(b)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/50 rounded"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => apiReq(`/api/blog/${b.id}`, "DELETE")}
                          className="p-1.5 text-[var(--red-core)] hover:text-[var(--red-glow)] hover:bg-[var(--border-default)]/50 rounded"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members Tab */}
            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-heading font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">
                    HUNTER CADRES
                  </h2>
                  <button
                    onClick={() => initMemberEdit()}
                    className="px-3 py-1.5 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white uppercase rounded flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> ADD CADRE
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((m) => (
                    <div key={m.id} className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="w-12 h-12 rounded-full border border-[var(--red-core)] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">{m.name}</h3>
                          <span className="font-mono text-xs text-[var(--red-core)] font-semibold">{m.role}</span>
                        </div>
                      </div>

                      <div className="border-t border-[var(--border-default)]/40 mt-4 pt-3 flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[var(--text-green)] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> DEPLOYED
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => initMemberEdit(m)}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]/50 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => apiReq(`/api/members/${m.id}`, "DELETE")}
                            className="p-1.5 text-[var(--red-core)] hover:text-[var(--red-glow)] hover:bg-[var(--border-default)]/50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* List Pane */}
                <div className="lg:col-span-2 border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                  <h2 className="font-heading font-bold text-lg text-[var(--text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2">
                    RECRUITMENT FILES
                  </h2>

                  <div className="space-y-2">
                    {applications.length === 0 ? (
                      <p className="font-mono text-xs text-[var(--text-dim)] italic p-4">No tactical recruits logged yet.</p>
                    ) : (
                      applications.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApplication(app)}
                          className={`p-3.5 border transition-all cursor-pointer flex justify-between items-center font-mono text-xs ${
                            selectedApplication?.id === app.id
                              ? "border-[var(--red-core)] bg-[var(--border-default)]/30"
                              : "border-[var(--border-default)] bg-[var(--bg-void)] hover:bg-[var(--border-default)]/10"
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-semibold text-[var(--text-primary)]">{app.name}</span>
                            <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{app.applied_at}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              app.status === "pending"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                : app.status === "accepted"
                                ? "bg-green-500/10 border-green-500/30 text-green-500"
                                : "bg-red-500/10 border-red-500/30 text-red-500"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Details Pane */}
                <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left relative min-h-[300px]">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
                  <h3 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2">
                    CANDIDATE DOSSIER
                  </h3>

                  {selectedApplication ? (
                    <div className="space-y-4 font-mono text-xs text-[var(--text-primary)]">
                      <div>
                        <span className="text-[var(--text-dim)] text-[10px] uppercase">FULL CALLSIGN</span>
                        <p className="font-semibold text-sm text-[var(--text-primary)]">{selectedApplication.name}</p>
                      </div>

                      <div>
                        <span className="text-[var(--text-dim)] text-[10px] uppercase">COMM CHANNEL</span>
                        <p className="text-sm">{selectedApplication.email}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[var(--text-dim)] text-[10px] uppercase">GITHUB</span>
                          <p className="text-sm">@{selectedApplication.github}</p>
                        </div>
                        <div>
                          <span className="text-[var(--text-dim)] text-[10px] uppercase">CTFTIME</span>
                          <p className="text-sm truncate">
                            <a href={selectedApplication.ctf_profile_url} target="_blank" rel="noreferrer" className="text-[var(--red-core)] hover:underline">
                              PROFILE_LINK
                            </a>
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[var(--text-dim)] text-[10px] uppercase">SPECIALIZATION CHECKLIST</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedApplication.skills?.map((sk) => (
                            <span key={sk} className="bg-[var(--border-default)] text-[var(--text-secondary)] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[var(--text-dim)] text-[10px] uppercase">OPERATIONAL DEPLOYMENT RECORD</span>
                        <p className="text-xs bg-[var(--bg-void)] p-2.5 border border-[var(--border-default)]/60 rounded text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {selectedApplication.experience_text}
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--text-dim)] text-[10px] uppercase">REASONING FOR COMMISSION</span>
                        <p className="text-xs bg-[var(--bg-void)] p-2.5 border border-[var(--border-default)]/60 rounded text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {selectedApplication.why_join}
                        </p>
                      </div>

                      {/* Action buttons */}
                      {selectedApplication.status === "pending" && (
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border-default)]/60">
                          <button
                            onClick={() => handleAppStatus(selectedApplication.id, "accepted")}
                            className="bg-[var(--text-green)] hover:bg-green-600 text-white py-2 px-3 font-bold uppercase text-[10px] tracking-wider rounded flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> ACCEPT RECRUIT
                          </button>
                          <button
                            onClick={() => handleAppStatus(selectedApplication.id, "rejected")}
                            className="bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-white py-2 px-3 font-bold uppercase text-[10px] tracking-wider rounded flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> DENY MISSION
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--text-dim)] italic py-20">
                      <HelpCircle className="w-10 h-10 mb-2 opacity-30" />
                      <span>Select candidate to inspect record files</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CMS Site Settings Tab */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 max-w-2xl mx-auto shadow-xl relative text-left">
                <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
                <h2 className="font-heading font-semibold text-lg text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-default)] pb-3 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[var(--red-core)]" /> CMS CONFIGURATION SYSTEM
                </h2>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">GLOBAL ANNOUNCEMENT BANNER</label>
                    <input
                      type="text"
                      value={settings.announcement_banner || ""}
                      onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">TEAM TACTICAL MOTTO</label>
                    <input
                      type="text"
                      value={settings.team_motto || ""}
                      onChange={(e) => setSettings({ ...settings, team_motto: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">FEATURED CTF CHAMPIONSHIP</label>
                    <input
                      type="text"
                      value={settings.featured_ctf || ""}
                      onChange={(e) => setSettings({ ...settings, featured_ctf: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[var(--text-secondary)] uppercase">TACTICAL NOTICE BANNER</label>
                    <input
                      type="text"
                      value={settings.site_notice || ""}
                      onChange={(e) => setSettings({ ...settings, site_notice: e.target.value })}
                      className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white rounded uppercase tracking-wider"
                  >
                    DEPLOY SYSTEM INTEGRATIONS
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
