export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface SocialAccount {
  id: string;
  platform: string;
  platformUserId: string | null;
  platformUsername: string | null;
  platformEmail: string | null;
  platformPhone: string | null;
  platformPassword: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecretKey: string | null;
  accessToken: string | null;
  accessTokenSecret: string | null;
  proxyUrl: string | null;
  proxyType: string | null;
  proxyCountry: string | null;
  proxyRotation: boolean | null;
  userAgent: string | null;
  fingerprint: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

export interface ForumAccount {
  id: string;
  portalName: string;
  portalUrl: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecretKey: string | null;
  accessToken: string | null;
  accessTokenSecret: string | null;
  notes: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

export interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  password: string | null;
  phone: string | null;
  recoveryEmail: string | null;
  smtpHost: string | null;
  smtpPort: string | null;
  imapHost: string | null;
  imapPort: string | null;
  apiKey: string | null;
  notes: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

export interface ContentItem {
  id: string;
  platform: string;
  contentType: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string | null;
}

export interface BehavioralPatterns {
  writing_style?: string;
  tone?: string;
  emoji_usage?: string;
  hashtag_style?: string;
}

export interface Persona {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
  gender: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  activeHoursStart: number | null;
  activeHoursEnd: number | null;
  maxPostsPerDay: number | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  isFavorite: boolean | null;
  influenceScore: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: Tag[];
  socialAccounts: SocialAccount[];
  forumAccounts: ForumAccount[];
  emailAccounts: EmailAccount[];
}

export interface EditFormData {
  name: string;
  bio: string;
  gender: string;
  birthDate: string;
  country: string;
  city: string;
  language: string;
  timezone: string;
  activeHoursStart: number;
  activeHoursEnd: number;
  maxPostsPerDay: number;
  isActive: boolean;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
}
