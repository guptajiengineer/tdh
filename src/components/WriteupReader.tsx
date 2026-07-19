import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Calendar, Eye, User, Tag, ChevronRight, Hash } from "lucide-react";
import { Writeup, Member, CTFEvent } from "../types";

interface WriteupReaderProps {
  writeup: Writeup;
  author?: Member;
  ctfEvent?: CTFEvent;
  onBack: () => void;
}

export default function WriteupReader({ writeup, author, ctfEvent, onBack }: WriteupReaderProps) {
  // Automatically generate Table of Contents from headings
  const toc = useMemo(() => {
    const lines = writeup.content.split("\n");
    const headings: { text: string; id: string; level: number }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/`|[*_]/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        headings.push({ text, id, level });
      }
    });

    return headings;
  }, [writeup.content]);

  // Handle smooth scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start text-left">
      {/* Table of Contents - Left Sidebar (Desktop) */}
      <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 font-mono text-xs text-left">
        <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2.5 mb-3 text-[var(--red-core)] uppercase font-bold tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>INDEX OF TACTICS</span>
        </div>
        
        {toc.length === 0 ? (
          <p className="text-[var(--text-dim)] italic">No index markers found in files.</p>
        ) : (
          <nav className="flex flex-col gap-2">
            {toc.map((heading, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSection(heading.id)}
                className={`text-left hover:text-[var(--red-core)] transition-colors flex items-start gap-1 text-[var(--text-secondary)] ${
                  heading.level === 3 ? "pl-4 text-[11px]" : "font-semibold"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--red-core)]/50" />
                <span>{heading.text}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="border-t border-[var(--border-default)] mt-4 pt-3 flex flex-col gap-1.5 text-[10px] text-[var(--text-dim)] uppercase">
          <div>AUTHOR: {author ? author.name.split(" '")[0] : "HUNTER_N/A"}</div>
          <div>CTF: {ctfEvent ? ctfEvent.name : "UNKNOWN_OPS"}</div>
          <div>DIFFICULTY: {writeup.difficulty}</div>
        </div>
      </div>

      {/* Main Editorial Content Column */}
      <div className="flex-1 min-w-0 border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 relative">
        {/* Aesthetic design handles */}
        <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--red-core)]" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--red-core)] transition-colors flex items-center gap-1 uppercase tracking-wider"
        >
          &lt; [TERMINATE_READ_STREAM / BACK]
        </button>

        {/* Article Header Metadata */}
        <header className="border-b border-[var(--border-default)] pb-6 mb-8 text-left">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="font-mono text-[10px] uppercase font-bold bg-[var(--red-core)]/10 border border-[var(--red-core)]/30 text-[var(--red-core)] px-2 py-0.5 rounded">
              {writeup.category}
            </span>
            <span
              className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                writeup.difficulty === "Easy"
                  ? "bg-green-500/10 border border-green-500/30 text-green-500"
                  : writeup.difficulty === "Medium"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-500"
                  : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}
            >
              {writeup.difficulty}
            </span>
          </div>

          <h1 className="font-heading font-semibold text-2xl md:text-3xl text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
            {writeup.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 font-mono text-xs text-[var(--text-secondary)]">
            {author && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--red-core)]" />
                <span>{author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--red-core)]" />
              <span>{writeup.published_at}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[var(--red-core)]" />
              <span>{writeup.views} SOLVES_READ</span>
            </div>
          </div>
        </header>

        {/* Render Markdown Content with Custom Renderers */}
        <div className="prose prose-invert max-w-none text-[var(--text-primary)] text-sm leading-relaxed space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Heading Customization with IDs so we can jump to sections
              h2: ({ children, ...props }) => {
                const text = React.Children.toArray(children).join("");
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return (
                  <h2
                    id={id}
                    className="font-heading font-semibold text-lg md:text-xl text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 mt-8 mb-4 tracking-wide uppercase flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4 text-[var(--red-core)]" />
                    {children}
                  </h2>
                );
              },
              h3: ({ children, ...props }) => {
                const text = React.Children.toArray(children).join("");
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return (
                  <h3
                    id={id}
                    className="font-heading font-semibold text-base text-[var(--text-primary)]/95 mt-6 mb-3 tracking-wide uppercase flex items-center gap-2"
                  >
                    <span className="text-[var(--red-core)]">&gt;&gt;</span>
                    {children}
                  </h3>
                );
              },
              p: ({ children }) => <p className="mb-4 text-[var(--text-primary)]/90">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[var(--text-primary)]/95">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[var(--text-primary)]/95">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              // Blockquote left red border style
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--red-core)] bg-[var(--border-default)]/10 px-4 py-2 italic my-4 text-[var(--text-secondary)]">
                  {children}
                </blockquote>
              ),
              // Code Block with custom styling (JetBrains Mono, custom dark background, red line indicators)
              code: ({ inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <div className="my-5 border border-[var(--border-default)] rounded overflow-hidden">
                    <div className="bg-[var(--bg-void)] px-4 py-1.5 border-b border-[var(--border-default)] flex justify-between items-center font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
                      <span>TACTICAL CODE DECRYPT // {match[1]}</span>
                      <span className="text-[var(--red-core)]">LIVE_DUMP</span>
                    </div>
                    <pre className="bg-[var(--bg-void)]/90 p-4 overflow-x-auto text-xs font-mono text-[var(--text-primary)] leading-relaxed select-text text-left">
                      <code>{String(children).replace(/\n$/, "")}</code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-[var(--border-default)] text-[var(--red-glow)] text-[11px] font-mono px-1.5 py-0.5 rounded font-medium">
                    {children}
                  </code>
                );
              },
            }}
          >
            {writeup.content}
          </ReactMarkdown>
        </div>

        {/* Writeup Footer Related CTFs */}
        <div className="mt-12 pt-6 border-t border-[var(--border-default)] text-left">
          <h4 className="font-heading font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            OPERATIONAL LOG: {ctfEvent?.name}
          </h4>
          <p className="font-mono text-[11px] text-[var(--text-dim)] leading-relaxed uppercase">
            This challenge was completed during {ctfEvent?.name} qualifiers under tactical guidelines. For security
            inquiries regarding proof-of-concept shellcodes, contact Alexander 'Daemon' Cross.
          </p>
        </div>
      </div>
    </div>
  );
}
