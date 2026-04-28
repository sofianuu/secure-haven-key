// Mock data for the admin panel — SSI users, devices, and audit logs.

export type UserStatus = 'active' | 'suspended' | 'pending';
export type DeviceType = 'iOS' | 'Android' | 'Desktop';
export type DeviceTrust = 'TEE' | 'StrongBox' | 'Secure Enclave' | 'Software';

export interface AdminDevice {
  id: string;
  label: string;
  type: DeviceType;
  trust: DeviceTrust;
  lastSeen: Date;
  revoked: boolean;
}

export interface AdminUser {
  id: string;
  did: string; // Decentralized Identifier
  alias: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  lastAuth: Date;
  devices: AdminDevice[];
}

export type AuditEvent =
  | 'auth.success'
  | 'auth.failed'
  | 'vault.unlock'
  | 'vault.export'
  | 'device.registered'
  | 'device.revoked'
  | 'key.rotated'
  | 'policy.updated';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: Date;
  event: AuditEvent;
  severity: AuditSeverity;
  userAlias: string;
  did: string;
  ip: string;
  device: string;
  details: string;
}

const minutes = (n: number) => new Date(Date.now() - n * 60_000);
const hours = (n: number) => new Date(Date.now() - n * 3_600_000);
const days = (n: number) => new Date(Date.now() - n * 86_400_000);

export const MOCK_USERS: AdminUser[] = [
  {
    id: 'u_01',
    did: 'did:key:z6Mki...8aQv',
    alias: 'alice.eth',
    email: 'alice@keyforge.io',
    status: 'active',
    createdAt: days(120),
    lastAuth: minutes(4),
    devices: [
      { id: 'd_01', label: 'iPhone 15 Pro', type: 'iOS', trust: 'Secure Enclave', lastSeen: minutes(4), revoked: false },
      { id: 'd_02', label: 'MacBook Pro 16"', type: 'Desktop', trust: 'Secure Enclave', lastSeen: hours(2), revoked: false },
    ],
  },
  {
    id: 'u_02',
    did: 'did:key:z6Mko...K2pL',
    alias: 'bob.dev',
    email: 'bob@keyforge.io',
    status: 'active',
    createdAt: days(86),
    lastAuth: hours(1),
    devices: [
      { id: 'd_03', label: 'Pixel 8', type: 'Android', trust: 'StrongBox', lastSeen: hours(1), revoked: false },
    ],
  },
  {
    id: 'u_03',
    did: 'did:key:z6Mkr...9xWq',
    alias: 'carol.sec',
    email: 'carol@keyforge.io',
    status: 'suspended',
    createdAt: days(45),
    lastAuth: days(3),
    devices: [
      { id: 'd_04', label: 'Galaxy S24', type: 'Android', trust: 'TEE', lastSeen: days(3), revoked: true },
    ],
  },
  {
    id: 'u_04',
    did: 'did:key:z6Mkn...4tBn',
    alias: 'dan.io',
    email: 'dan@keyforge.io',
    status: 'pending',
    createdAt: hours(6),
    lastAuth: hours(6),
    devices: [],
  },
  {
    id: 'u_05',
    did: 'did:key:z6Mkv...7hRp',
    alias: 'eve.node',
    email: 'eve@keyforge.io',
    status: 'active',
    createdAt: days(210),
    lastAuth: minutes(22),
    devices: [
      { id: 'd_05', label: 'iPad Pro M4', type: 'iOS', trust: 'Secure Enclave', lastSeen: minutes(22), revoked: false },
      { id: 'd_06', label: 'ThinkPad X1', type: 'Desktop', trust: 'Software', lastSeen: days(1), revoked: false },
    ],
  },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l_01', timestamp: minutes(2),  event: 'auth.success',     severity: 'info',     userAlias: 'alice.eth', did: 'did:key:z6Mki...8aQv', ip: '82.78.14.22',  device: 'iPhone 15 Pro',  details: 'Biometric unlock via Secure Enclave' },
  { id: 'l_02', timestamp: minutes(7),  event: 'vault.unlock',     severity: 'info',     userAlias: 'alice.eth', did: 'did:key:z6Mki...8aQv', ip: '82.78.14.22',  device: 'iPhone 15 Pro',  details: 'Vault decrypted (AES-256-GCM)' },
  { id: 'l_03', timestamp: minutes(18), event: 'auth.failed',      severity: 'warning',  userAlias: 'bob.dev',   did: 'did:key:z6Mko...K2pL', ip: '193.226.4.119', device: 'Pixel 8',        details: 'Biometric mismatch (attempt 1/3)' },
  { id: 'l_04', timestamp: hours(1),    event: 'device.registered',severity: 'info',     userAlias: 'eve.node',  did: 'did:key:z6Mkv...7hRp', ip: '45.12.88.7',   device: 'iPad Pro M4',    details: 'New device bound to DID' },
  { id: 'l_05', timestamp: hours(2),    event: 'key.rotated',      severity: 'info',     userAlias: 'alice.eth', did: 'did:key:z6Mki...8aQv', ip: '82.78.14.22',  device: 'MacBook Pro 16"', details: 'Hardware key rotated successfully' },
  { id: 'l_06', timestamp: hours(5),    event: 'auth.failed',      severity: 'critical', userAlias: 'carol.sec', did: 'did:key:z6Mkr...9xWq', ip: '5.255.99.41',  device: 'Galaxy S24',     details: '5 failed attempts — account suspended' },
  { id: 'l_07', timestamp: hours(8),    event: 'device.revoked',   severity: 'warning',  userAlias: 'carol.sec', did: 'did:key:z6Mkr...9xWq', ip: 'system',       device: 'Galaxy S24',     details: 'Device revoked by admin policy' },
  { id: 'l_08', timestamp: days(1),     event: 'vault.export',     severity: 'warning',  userAlias: 'eve.node',  did: 'did:key:z6Mkv...7hRp', ip: '45.12.88.7',   device: 'ThinkPad X1',    details: 'Encrypted vault exported (412 entries)' },
  { id: 'l_09', timestamp: days(2),     event: 'policy.updated',   severity: 'info',     userAlias: 'admin',     did: 'did:key:z6Mka...0000', ip: 'system',       device: 'Console',        details: 'Auto-lock policy: 5min → 3min' },
  { id: 'l_10', timestamp: days(2),     event: 'auth.success',     severity: 'info',     userAlias: 'bob.dev',   did: 'did:key:z6Mko...K2pL', ip: '193.226.4.119', device: 'Pixel 8',        details: 'StrongBox attestation verified' },
];

// 14-day auth activity for the chart.
export const AUTH_TIMELINE: { day: string; success: number; failed: number }[] = [
  { day: 'Mon', success: 142, failed: 4 },
  { day: 'Tue', success: 168, failed: 2 },
  { day: 'Wed', success: 155, failed: 7 },
  { day: 'Thu', success: 189, failed: 3 },
  { day: 'Fri', success: 211, failed: 5 },
  { day: 'Sat', success: 98,  failed: 1 },
  { day: 'Sun', success: 76,  failed: 2 },
  { day: 'Mon', success: 178, failed: 6 },
  { day: 'Tue', success: 195, failed: 3 },
  { day: 'Wed', success: 203, failed: 4 },
  { day: 'Thu', success: 221, failed: 8 },
  { day: 'Fri', success: 234, failed: 5 },
  { day: 'Sat', success: 112, failed: 1 },
  { day: 'Sun', success: 89,  failed: 2 },
];

export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
