import React, { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";

interface NavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminLoggedIn: boolean;
  onGoAdmin: () => void;
}

export default function NavBar({ currentView, onNavigate, isAdminLoggedIn, onGoAdmin }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "CTFs", id: "ctfs" },
    { name: "Writeups", id: "writeups" },
    { name: "Blog", id: "blog" },
    { name: "Team", id: "team" }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleLinkClick("home")}
            className="flex items-center gap-3 group select-none transition-opacity"
          >
            <div className="w-10 h-10 border-2 border-[var(--border-default)] flex items-center justify-center text-[var(--red-core)] group-hover:bg-[var(--red-core)] group-hover:text-[var(--text-inverted)] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left flex flex-col justify-center">
              <span className="nav-logo-name block mt-1">
                DEVIL HUNTERS
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`nav-link ${currentView === link.id ? "active" : ""}`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right CTA / Admin Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onGoAdmin}
              className={`nav-link border-2 font-bold px-3 py-1 ${
                isAdminLoggedIn
                  ? "border-[var(--text-green)] text-[var(--text-green)] bg-[var(--text-green)]/10"
                  : "border-transparent text-[var(--text-secondary)]"
              }`}
            >
              {isAdminLoggedIn ? "OPERATIONS" : "ADMIN"}
            </button>
            <button
              onClick={() => handleLinkClick("apply")}
              className="btn-join"
            >
              JOIN SQUAD
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-[var(--text-primary)] hover:text-[var(--red-core)]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Full Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[var(--bg-void)] z-30 flex flex-col items-center justify-center p-6 md:hidden">
          <div className="flex flex-col gap-6 font-mono text-xl font-bold uppercase text-center tracking-widest select-none z-10 w-full">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-colors py-4 border-2 border-[var(--border-default)] ${
                  currentView === link.id ? "bg-[var(--border-default)] text-[var(--text-inverted)]" : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                }`}
              >
                {link.name}
              </button>
            ))}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGoAdmin();
              }}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-4"
            >
              {isAdminLoggedIn ? "WAR ROOM DASHBOARD" : "ADMIN GATEWAY"}
            </button>

            <button
              onClick={() => handleLinkClick("apply")}
              className="btn-join mt-4"
            >
              JOIN THE HUNTERS
            </button>
          </div>
        </div>
      )}
    </>
  );
}
