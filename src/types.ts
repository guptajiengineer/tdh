export interface Member {
  id: string;
  name: string;
  role: 'Captain' | 'Member' | 'Alumni';
  avatar_url: string;
  bio: string;
  skills: string[];
  social_links: {
    github?: string;
    twitter?: string;
    ctftime?: string;
  };
  is_active: boolean;
  joined_at: string;
}

export interface CTFEvent {
  id: string;
  name: string;
  organizer: string;
  date: string;
  placement: number;
  team_score: number;
  total_teams: number;
  tags: string[];
  description: string;
  is_upcoming: boolean;
}

export interface Writeup {
  id: string;
  title: string;
  slug: string;
  ctf_event_id: string;
  author_id: string;
  content: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  category: 'Web' | 'Reverse' | 'OSINT' | 'Forensics' | 'Crypto' | 'PWN';
  published_at: string;
  views: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  published_at: string;
  status: 'draft' | 'published';
}

export interface Application {
  id: string;
  name: string;
  email: string;
  github: string;
  ctf_profile_url: string;
  skills: string[];
  experience_text: string;
  why_join: string;
  best_writeup: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}
