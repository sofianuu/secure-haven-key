export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: 'social' | 'finance' | 'work' | 'personal' | 'crypto';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  strength: 'weak' | 'medium' | 'strong';
  favorite: boolean;
}

export interface CryptoKey {
  id: string;
  name: string;
  type: 'signing' | 'encryption' | 'identity';
  publicKey: string;
  createdAt: Date;
  status: 'active' | 'revoked' | 'expired';
}

export const CATEGORIES = [
  { value: 'social' as const, label: 'Social', icon: '🌐' },
  { value: 'finance' as const, label: 'Finance', icon: '💳' },
  { value: 'work' as const, label: 'Work', icon: '💼' },
  { value: 'personal' as const, label: 'Personal', icon: '🔑' },
  { value: 'crypto' as const, label: 'Crypto', icon: '🪙' },
];

export function generatePassword(length = 20, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }): string {
  let chars = '';
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}

export function evaluateStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

const DEMO_PASSWORDS: PasswordEntry[] = [
  { id: '1', title: 'GitHub', username: 'dev@keyforge.io', password: 'Kx9#mP2$vL7nQ4', url: 'https://github.com', category: 'work', createdAt: new Date(), updatedAt: new Date(), strength: 'strong', favorite: true, notes: '' },
  { id: '2', title: 'Coinbase', username: 'vault@keyforge.io', password: 'Zr8!wN5@jH3bY6', url: 'https://coinbase.com', category: 'crypto', createdAt: new Date(), updatedAt: new Date(), strength: 'strong', favorite: false, notes: '' },
  { id: '3', title: 'Twitter / X', username: '@keyforge_sec', password: 'Tm4&cF9*dA2kS7', url: 'https://x.com', category: 'social', createdAt: new Date(), updatedAt: new Date(), strength: 'strong', favorite: true, notes: '' },
  { id: '4', title: 'Chase Bank', username: 'finance@keyforge.io', password: 'Bp6#qW1$eR8nU3', url: 'https://chase.com', category: 'finance', createdAt: new Date(), updatedAt: new Date(), strength: 'strong', favorite: false, notes: '' },
  { id: '5', title: 'Notion', username: 'notes@keyforge.io', password: 'Hy7!xJ4@mK9vL2', url: 'https://notion.so', category: 'work', createdAt: new Date(), updatedAt: new Date(), strength: 'strong', favorite: false, notes: '' },
];

const DEMO_KEYS: CryptoKey[] = [
  { id: '1', name: 'Primary Identity', type: 'identity', publicKey: '0x7a3b...f92c', createdAt: new Date(), status: 'active' },
  { id: '2', name: 'Document Signing', type: 'signing', publicKey: '0x4e1d...a83b', createdAt: new Date(), status: 'active' },
  { id: '3', name: 'E2E Encryption', type: 'encryption', publicKey: '0x9c5f...d71e', createdAt: new Date(), status: 'active' },
];

export function getDemoPasswords(): PasswordEntry[] { return [...DEMO_PASSWORDS]; }
export function getDemoKeys(): CryptoKey[] { return [...DEMO_KEYS]; }
