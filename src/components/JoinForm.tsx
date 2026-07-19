import React, { useState } from "react";
import { ShieldAlert, Check, HelpCircle, ArrowRight } from "lucide-react";

interface JoinFormProps {
  onSuccess: () => void;
}

export default function JoinForm({ onSuccess }: JoinFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [ctfProfile, setCtfProfile] = useState("");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [bestWriteup, setBestWriteup] = useState("");
  
  // Selected Skills checklist
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const domains = [
    "Web Exploitation",
    "Reverse Engineering",
    "OSINT",
    "Forensics",
    "Cryptography",
    "PWN"
  ];

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      alert("ALERT: Select at least one cyber specialization domain.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        github,
        ctf_profile_url: ctfProfile,
        skills: selectedSkills,
        experience_text: experience,
        why_join: whyJoin,
        best_writeup: bestWriteup
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error("Application submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--red-core)]" />
      
      {submitted ? (
        <div className="py-12 flex flex-col items-center justify-center text-center font-mono gap-4 select-none">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 flex items-center justify-center animate-bounce">
            <Check className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-[var(--text-primary)] uppercase tracking-wider">
              TRANSMISSION RECEIVED
            </h3>
            <p className="text-xs text-[var(--text-secondary)] uppercase mt-1">
              RECRUIT FILE WRITTEN TO ACTIVE CADRE MEM_BLOCKS
            </p>
          </div>
          <p className="text-xs text-[var(--text-dim)] max-w-sm mt-2 leading-relaxed">
            Our commanding council Alexander 'Daemon' Cross will review your cryptography solutions and CTF profiles. Prepare for live trace assessment...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <header className="border-b border-[var(--border-default)] pb-4 mb-4">
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[var(--text-primary)] tracking-wide uppercase">
              RECRUIT ENLISTMENT PORTAL
            </h2>
            <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
              WE DO NOT PLAY CTFS. WE HUNT THEM. DISCLOSE YOUR PROFILE FOR CONSIDERATION.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">Your Handle / Callsign *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cipher, Phantom"
                className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">Secure Communication Channel *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. agent@protonmail.com"
                className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">GitHub Profile User *</label>
              <input
                type="text"
                required
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. shadow-agent"
                className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">CTFTime Profile URL *</label>
              <input
                type="url"
                required
                value={ctfProfile}
                onChange={(e) => setCtfProfile(e.target.value)}
                placeholder="e.g. https://ctftime.org/user/..."
                className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
              />
            </div>
          </div>

          {/* Specialization Domain Checkbox Checklist */}
          <div>
            <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold block mb-2.5">
              CHOOSE DEPLOYMENT SPECIALIZATIONS (SELECT ALL APPLICABLE) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs select-none">
              {domains.map((domain) => {
                const isActive = selectedSkills.includes(domain);
                return (
                  <div
                    key={domain}
                    onClick={() => handleSkillToggle(domain)}
                    className={`border p-3 rounded cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? "border-[var(--red-core)] bg-[var(--red-core)]/10 text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-void)] hover:bg-[var(--border-default)]/25 text-[var(--text-secondary)]"
                    }`}
                  >
                    <span>{domain}</span>
                    <div className={`w-4 h-4 border flex items-center justify-center ${isActive ? "border-[var(--red-core)]" : "border-[var(--border-default)]"}`}>
                      {isActive && <div className="w-2.5 h-2.5 bg-[var(--red-core)]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">Operational Experience Summary *</label>
            <textarea
              required
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Detail your competitive history, CVEs discovered, or low-level exploit analysis..."
              className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded p-3 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">Reasoning For Commission Request *</label>
            <textarea
              required
              rows={3}
              value={whyJoin}
              onChange={(e) => setWhyJoin(e.target.value)}
              placeholder="Why Devil Hunters squad? What active research or tooling can you introduce?"
              className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded p-3 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-[var(--text-secondary)] uppercase font-bold">Link to your best POC/Writeup *</label>
            <input
              type="url"
              required
              value={bestWriteup}
              onChange={(e) => setBestWriteup(e.target.value)}
              placeholder="e.g. GitHub markdown, Blogpost URL, Gist link"
              className="bg-[var(--bg-void)] border border-[var(--border-default)] rounded px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--red-core)] outline-none font-mono"
            />
          </div>

          {/* Threat Advisory */}
          <div className="border border-[var(--red-core)]/20 bg-[var(--red-core)]/5 p-3.5 flex items-start gap-3 rounded">
            <ShieldAlert className="w-5 h-5 text-[var(--red-core)] shrink-0 mt-0.5" />
            <div className="font-mono text-[10px] text-[var(--text-secondary)] uppercase leading-relaxed text-left">
              <span className="font-bold text-[var(--text-primary)]">THREAT ADVISORY:</span> All applicants must undergo trace verification. Submission of false credentials, plagiarized writeups, or double-agent routing will result in permanent ban lists.
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[var(--red-core)] hover:bg-[var(--red-glow)] text-xs font-mono font-bold text-white uppercase rounded tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <span>{submitting ? "STAGING DATA..." : "TRANSMIT DOSSIER"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
