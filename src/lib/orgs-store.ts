// In-memory store for the Organizations module.
// Simulates: RBAC, ECDH Team Key distribution, key rotation, hybrid delete,
// epoch monotonicity (rollback protection) and an audit chain (DB + blockchain).

import { useSyncExternalStore } from "react";

export type Role = "ORG_ADMIN" | "TEAM_ADMIN" | "MEMBER" | "VIEWER";
export type CredentialKind = "SHARED" | "INDIVIDUAL";

export interface Member {
  id: string;
  alias: string;
  did: string;
  // ECDH public key (mock — random hex)
  ecdhPub: string;
}

export interface TeamMembership {
  memberId: string;
  role: Role;
  // Team Key wrapped (ECDH) for this member at the current epoch.
  wrappedKey: string;
  epoch: number;
}

export interface SharedCredential {
  id: string;
  kind: "SHARED";
  title: string;
  url?: string;
  notes?: string;
  // Sensitive data is "encrypted" with the Team Key (mock = base64 + epoch).
  cipherUsername: string;
  cipherPassword: string;
  epoch: number;
  deleted: boolean; // soft-deleted metadata; sensitive fields wiped on delete.
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualSlot {
  // Per-member sensitive data for an individual template.
  memberId: string;
  cipherUsername: string;
  cipherPassword: string;
}

export interface IndividualCredential {
  id: string;
  kind: "INDIVIDUAL";
  title: string;
  url?: string;
  notes?: string;
  slots: IndividualSlot[];
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Credential = SharedCredential | IndividualCredential;

export interface Team {
  id: string;
  name: string;
  orgId: string;
  // Current Team Key epoch. Increases monotonically on rotation.
  epoch: number;
  // The plaintext Team Key only exists in memory in the mock world.
  teamKey: string;
  memberships: TeamMembership[];
  credentials: Credential[];
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  teams: Team[];
}

export type AuditChannel = "db" | "chain";
export type AuditEvent =
  | "CREDENTIAL_ACCESS"
  | "CREDENTIAL_DELETE"
  | "CREDENTIAL_CREATE"
  | "CREDENTIAL_UPDATE"
  | "TEAM_CREATED"
  | "TEAM_DELETED"
  | "ORG_CREATED"
  | "ORG_DELETED"
  | "ORG_OWNERSHIP_TRANSFERRED"
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "ROLE_CHANGED"
  | "KEY_ROTATED";

export interface AuditEntry {
  id: string;
  ts: Date;
  channel: AuditChannel;
  event: AuditEvent;
  orgId?: string;
  teamId?: string;
  actorId: string;
  target?: string;
  // Hash chain — every chain entry references the previous hash.
  prevHash?: string;
  hash?: string;
  details: string;
}

// ---------- mock crypto ----------
const rand = (n = 16) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const enc = (plaintext: string, key: string, epoch: number) =>
  `enc:e${epoch}:${btoa(`${key.slice(0, 6)}|${plaintext}`)}`;

const dec = (cipher: string, key: string, epoch: number): string => {
  const parts = cipher.split(":");
  if (parts[0] !== "enc") return "[corrupted]";
  const cipherEpoch = Number(parts[1].slice(1));
  if (cipherEpoch !== epoch) return "[rollback-blocked]";
  try {
    const raw = atob(parts.slice(2).join(":"));
    const [keyHint, plain] = raw.split("|");
    if (keyHint !== key.slice(0, 6)) return "[wrong-key]";
    return plain;
  } catch {
    return "[corrupted]";
  }
};

const wrap = (teamKey: string, ecdhPub: string) =>
  `wrap:${btoa(`${ecdhPub.slice(0, 8)}~${teamKey}`)}`;

async function hash(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

// ---------- mock seed ----------
const seedMembers: Member[] = [
  { id: "m_alice", alias: "alice.eth", did: "did:key:z6Mki...8aQv", ecdhPub: rand() },
  { id: "m_bob", alias: "bob.dev", did: "did:key:z6Mko...K2pL", ecdhPub: rand() },
  { id: "m_carol", alias: "carol.sec", did: "did:key:z6Mkr...9xWq", ecdhPub: rand() },
  { id: "m_dan", alias: "dan.io", did: "did:key:z6Mkn...4tBn", ecdhPub: rand() },
  { id: "m_eve", alias: "eve.node", did: "did:key:z6Mkv...7hRp", ecdhPub: rand() },
];

function buildSeed(): { orgs: Organization[]; audit: AuditEntry[]; me: string; members: Member[] } {
  const teamKey1 = rand(32);
  const teamKey2 = rand(32);
  const orgs: Organization[] = [
    {
      id: "o_keyforge",
      name: "KeyForge Labs",
      ownerId: "m_alice",
      createdAt: new Date(Date.now() - 86_400_000 * 90),
      teams: [
        {
          id: "t_eng",
          name: "Engineering",
          orgId: "o_keyforge",
          epoch: 1,
          teamKey: teamKey1,
          memberships: [
            { memberId: "m_alice", role: "ORG_ADMIN", wrappedKey: wrap(teamKey1, seedMembers[0].ecdhPub), epoch: 1 },
            { memberId: "m_bob", role: "TEAM_ADMIN", wrappedKey: wrap(teamKey1, seedMembers[1].ecdhPub), epoch: 1 },
            { memberId: "m_eve", role: "MEMBER", wrappedKey: wrap(teamKey1, seedMembers[4].ecdhPub), epoch: 1 },
          ],
          credentials: [
            {
              id: "c_aws",
              kind: "SHARED",
              title: "AWS Console — Prod",
              url: "https://console.aws.amazon.com",
              notes: "Break-glass account",
              cipherUsername: enc("ops@keyforge.io", teamKey1, 1),
              cipherPassword: enc("Tr0ub4dor&3-Prod!", teamKey1, 1),
              epoch: 1,
              deleted: false,
              createdAt: new Date(Date.now() - 86_400_000 * 30),
              updatedAt: new Date(Date.now() - 86_400_000 * 2),
            },
            {
              id: "c_gh",
              kind: "INDIVIDUAL",
              title: "GitHub — Personal",
              url: "https://github.com",
              notes: "Each member sets their own token",
              slots: [
                { memberId: "m_alice", cipherUsername: enc("alice", teamKey1, 1), cipherPassword: enc("ghp_alice_xxx", teamKey1, 1) },
              ],
              deleted: false,
              createdAt: new Date(Date.now() - 86_400_000 * 10),
              updatedAt: new Date(Date.now() - 86_400_000 * 1),
            },
          ],
        },
        {
          id: "t_ops",
          name: "Operations",
          orgId: "o_keyforge",
          epoch: 1,
          teamKey: teamKey2,
          memberships: [
            { memberId: "m_alice", role: "ORG_ADMIN", wrappedKey: wrap(teamKey2, seedMembers[0].ecdhPub), epoch: 1 },
            { memberId: "m_carol", role: "VIEWER", wrappedKey: wrap(teamKey2, seedMembers[2].ecdhPub), epoch: 1 },
          ],
          credentials: [],
        },
      ],
    },
    {
      id: "o_acme",
      name: "Acme Corp",
      ownerId: "m_bob",
      createdAt: new Date(Date.now() - 86_400_000 * 12),
      teams: [],
    },
  ];

  return { orgs, audit: [], me: "m_alice", members: seedMembers };
}

interface State {
  orgs: Organization[];
  audit: AuditEntry[];
  me: string;
  members: Member[];
}

let state: State = buildSeed();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useOrgsStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

// ---------- audit helpers ----------
async function pushAudit(entry: Omit<AuditEntry, "id" | "ts" | "hash" | "prevHash">) {
  const prev = state.audit.filter((a) => a.channel === "chain").slice(-1)[0];
  const base: AuditEntry = { ...entry, id: rand(8), ts: new Date() };
  if (entry.channel === "chain") {
    base.prevHash = prev?.hash;
    base.hash = await hash(`${prev?.hash ?? "GENESIS"}|${entry.event}|${entry.actorId}|${entry.target ?? ""}|${Date.now()}`);
  }
  state = { ...state, audit: [base, ...state.audit] };
  emit();
}

// ---------- RBAC ----------
export function getMyRole(team: Team, memberId: string): Role | null {
  return team.memberships.find((m) => m.memberId === memberId)?.role ?? null;
}

export function canManageOrg(org: Organization, memberId: string) {
  return org.ownerId === memberId || org.teams.some((t) => getMyRole(t, memberId) === "ORG_ADMIN");
}

// ---------- mutations ----------
export const actions = {
  setMe(memberId: string) {
    state = { ...state, me: memberId };
    emit();
  },

  async createOrg(name: string) {
    const id = `o_${rand(4)}`;
    const org: Organization = {
      id,
      name,
      ownerId: state.me,
      createdAt: new Date(),
      teams: [],
    };
    state = { ...state, orgs: [...state.orgs, org] };
    emit();
    await pushAudit({ channel: "db", event: "ORG_CREATED", actorId: state.me, orgId: id, details: `Created org "${name}"` });
    await pushAudit({ channel: "chain", event: "ORG_CREATED", actorId: state.me, orgId: id, details: `ORG_CREATED ${id}` });
  },

  async deleteOrg(orgId: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    if (!org || org.ownerId !== state.me) return;
    state = { ...state, orgs: state.orgs.filter((o) => o.id !== orgId) };
    emit();
    await pushAudit({ channel: "chain", event: "ORG_DELETED", actorId: state.me, orgId, details: `Cascade delete of ${org.name}` });
  },

  async transferOwnership(orgId: string, newOwnerId: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    if (!org || org.ownerId !== state.me) return;
    state = {
      ...state,
      orgs: state.orgs.map((o) => (o.id === orgId ? { ...o, ownerId: newOwnerId } : o)),
    };
    emit();
    await pushAudit({
      channel: "chain",
      event: "ORG_OWNERSHIP_TRANSFERRED",
      actorId: state.me,
      orgId,
      target: newOwnerId,
      details: `Owner → ${newOwnerId}`,
    });
  },

  async createTeam(orgId: string, name: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    if (!org) return;
    // RBAC: only ORG_ADMIN or owner
    const isAdmin = org.ownerId === state.me ||
      org.teams.some((t) => getMyRole(t, state.me) === "ORG_ADMIN");
    if (!isAdmin) return;

    const teamKey = rand(32);
    const me = state.members.find((m) => m.id === state.me)!;
    const team: Team = {
      id: `t_${rand(4)}`,
      name,
      orgId,
      epoch: 1,
      teamKey,
      memberships: [
        { memberId: state.me, role: "TEAM_ADMIN", wrappedKey: wrap(teamKey, me.ecdhPub), epoch: 1 },
      ],
      credentials: [],
    };
    state = {
      ...state,
      orgs: state.orgs.map((o) => (o.id === orgId ? { ...o, teams: [...o.teams, team] } : o)),
    };
    emit();
    await pushAudit({ channel: "db", event: "TEAM_CREATED", actorId: state.me, orgId, teamId: team.id, details: `Team "${name}"` });
  },

  async deleteTeam(orgId: string, teamId: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    if (!org) return;
    const team = org.teams.find((t) => t.id === teamId);
    if (!team) return;
    const active = team.credentials.filter((c) => !c.deleted);
    if (active.length > 0) {
      throw new Error("Team must be empty (no active credentials) before deletion.");
    }
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId ? { ...o, teams: o.teams.filter((t) => t.id !== teamId) } : o,
      ),
    };
    emit();
    await pushAudit({ channel: "chain", event: "TEAM_DELETED", actorId: state.me, orgId, teamId, details: `Team ${team.name} removed` });
  },

  async inviteMember(orgId: string, teamId: string, memberId: string, role: Role) {
    const org = state.orgs.find((o) => o.id === orgId);
    const team = org?.teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.memberships.find((m) => m.memberId === memberId)) return;
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return;
    const wrapped = wrap(team.teamKey, member.ecdhPub);
    const newMembership: TeamMembership = { memberId, role, wrappedKey: wrapped, epoch: team.epoch };
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId ? { ...t, memberships: [...t.memberships, newMembership] } : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "MEMBER_INVITED", actorId: state.me, orgId, teamId, target: memberId, details: `As ${role}` });
  },

  async removeMember(orgId: string, teamId: string, memberId: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    const team = org?.teams.find((t) => t.id === teamId);
    if (!team) return;

    // Rotate Team Key on member removal.
    const newKey = rand(32);
    const newEpoch = team.epoch + 1;
    const newMemberships = team.memberships
      .filter((m) => m.memberId !== memberId)
      .map((m) => {
        const mem = state.members.find((x) => x.id === m.memberId)!;
        return { ...m, wrappedKey: wrap(newKey, mem.ecdhPub), epoch: newEpoch };
      });

    // Re-encrypt every credential's sensitive data with the new key.
    const newCreds = team.credentials.map((c) => {
      if (c.deleted) return c;
      if (c.kind === "SHARED") {
        const u = dec(c.cipherUsername, team.teamKey, team.epoch);
        const p = dec(c.cipherPassword, team.teamKey, team.epoch);
        return {
          ...c,
          cipherUsername: enc(u, newKey, newEpoch),
          cipherPassword: enc(p, newKey, newEpoch),
          epoch: newEpoch,
        };
      }
      // INDIVIDUAL: drop removed member's slot, re-encrypt others.
      return {
        ...c,
        slots: c.slots
          .filter((s) => s.memberId !== memberId)
          .map((s) => ({
            ...s,
            cipherUsername: enc(dec(s.cipherUsername, team.teamKey, team.epoch), newKey, newEpoch),
            cipherPassword: enc(dec(s.cipherPassword, team.teamKey, team.epoch), newKey, newEpoch),
          })),
      };
    });

    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId
                  ? { ...t, teamKey: newKey, epoch: newEpoch, memberships: newMemberships, credentials: newCreds }
                  : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "MEMBER_REMOVED", actorId: state.me, orgId, teamId, target: memberId, details: `Removed + key rotated` });
    await pushAudit({ channel: "db", event: "KEY_ROTATED", actorId: state.me, orgId, teamId, details: `Epoch → ${newEpoch}` });
  },

  async changeRole(orgId: string, teamId: string, memberId: string, role: Role, actorRole: Role) {
    // TEAM_ADMIN can only set MEMBER/VIEWER. ORG_ADMIN can set anything.
    if (actorRole === "TEAM_ADMIN" && (role === "ORG_ADMIN" || role === "TEAM_ADMIN")) return;
    if (actorRole !== "ORG_ADMIN" && actorRole !== "TEAM_ADMIN") return;
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      memberships: t.memberships.map((m) =>
                        m.memberId === memberId ? { ...m, role } : m,
                      ),
                    }
                  : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "ROLE_CHANGED", actorId: state.me, orgId, teamId, target: memberId, details: `→ ${role}` });
  },

  async createSharedCredential(orgId: string, teamId: string, title: string, username: string, password: string, url?: string, notes?: string) {
    const org = state.orgs.find((o) => o.id === orgId);
    const team = org?.teams.find((t) => t.id === teamId);
    if (!team) return;
    const cred: SharedCredential = {
      id: `c_${rand(4)}`,
      kind: "SHARED",
      title,
      url,
      notes,
      cipherUsername: enc(username, team.teamKey, team.epoch),
      cipherPassword: enc(password, team.teamKey, team.epoch),
      epoch: team.epoch,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    actions._addCred(orgId, teamId, cred);
    await pushAudit({ channel: "db", event: "CREDENTIAL_CREATE", actorId: state.me, orgId, teamId, target: cred.id, details: `Shared "${title}"` });
  },

  async createIndividualTemplate(orgId: string, teamId: string, title: string, url?: string, notes?: string) {
    const cred: IndividualCredential = {
      id: `c_${rand(4)}`,
      kind: "INDIVIDUAL",
      title,
      url,
      notes,
      slots: [],
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    actions._addCred(orgId, teamId, cred);
    await pushAudit({ channel: "db", event: "CREDENTIAL_CREATE", actorId: state.me, orgId, teamId, target: cred.id, details: `Individual template "${title}"` });
  },

  _addCred(orgId: string, teamId: string, cred: Credential) {
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId ? { ...t, credentials: [...t.credentials, cred] } : t,
              ),
            }
          : o,
      ),
    };
    emit();
  },

  async setIndividualSecret(orgId: string, teamId: string, credId: string, username: string, password: string) {
    const team = state.orgs.find((o) => o.id === orgId)?.teams.find((t) => t.id === teamId);
    if (!team) return;
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) => {
                if (t.id !== teamId) return t;
                return {
                  ...t,
                  credentials: t.credentials.map((c) => {
                    if (c.id !== credId || c.kind !== "INDIVIDUAL") return c;
                    const others = c.slots.filter((s) => s.memberId !== state.me);
                    return {
                      ...c,
                      updatedAt: new Date(),
                      slots: [
                        ...others,
                        {
                          memberId: state.me,
                          cipherUsername: enc(username, t.teamKey, t.epoch),
                          cipherPassword: enc(password, t.teamKey, t.epoch),
                        },
                      ],
                    };
                  }),
                };
              }),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "CREDENTIAL_UPDATE", actorId: state.me, orgId, teamId, target: credId, details: `Set personal secret` });
  },

  async updateCredentialMeta(orgId: string, teamId: string, credId: string, patch: { title?: string; url?: string; notes?: string }) {
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      credentials: t.credentials.map((c) =>
                        c.id === credId ? { ...c, ...patch, updatedAt: new Date() } : c,
                      ),
                    }
                  : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "CREDENTIAL_UPDATE", actorId: state.me, orgId, teamId, target: credId, details: `Metadata updated` });
  },

  async updateSharedSecret(orgId: string, teamId: string, credId: string, username: string, password: string) {
    const team = state.orgs.find((o) => o.id === orgId)?.teams.find((t) => t.id === teamId);
    if (!team) return;
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      credentials: t.credentials.map((c) =>
                        c.id === credId && c.kind === "SHARED"
                          ? {
                              ...c,
                              cipherUsername: enc(username, t.teamKey, t.epoch),
                              cipherPassword: enc(password, t.teamKey, t.epoch),
                              epoch: t.epoch,
                              updatedAt: new Date(),
                            }
                          : c,
                      ),
                    }
                  : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "db", event: "CREDENTIAL_UPDATE", actorId: state.me, orgId, teamId, target: credId, details: `Re-encrypted secret` });
  },

  async deleteCredential(orgId: string, teamId: string, credId: string) {
    // Hybrid delete: wipe sensitive ciphertext (hard), keep metadata (soft).
    state = {
      ...state,
      orgs: state.orgs.map((o) =>
        o.id === orgId
          ? {
              ...o,
              teams: o.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      credentials: t.credentials.map((c) => {
                        if (c.id !== credId) return c;
                        if (c.kind === "SHARED") {
                          return { ...c, deleted: true, cipherUsername: "", cipherPassword: "", updatedAt: new Date() };
                        }
                        return { ...c, deleted: true, slots: [], updatedAt: new Date() };
                      }),
                    }
                  : t,
              ),
            }
          : o,
      ),
    };
    emit();
    await pushAudit({ channel: "chain", event: "CREDENTIAL_DELETE", actorId: state.me, orgId, teamId, target: credId, details: `Hybrid delete` });
  },

  async revealCredential(orgId: string, teamId: string, credId: string): Promise<{ username: string; password: string } | null> {
    const team = state.orgs.find((o) => o.id === orgId)?.teams.find((t) => t.id === teamId);
    if (!team) return null;
    const cred = team.credentials.find((c) => c.id === credId);
    if (!cred || cred.deleted) return null;
    await pushAudit({ channel: "db", event: "CREDENTIAL_ACCESS", actorId: state.me, orgId, teamId, target: credId, details: `Reveal` });
    await pushAudit({ channel: "chain", event: "CREDENTIAL_ACCESS", actorId: state.me, orgId, teamId, target: credId, details: `On-chain proof` });
    if (cred.kind === "SHARED") {
      return {
        username: dec(cred.cipherUsername, team.teamKey, team.epoch),
        password: dec(cred.cipherPassword, team.teamKey, team.epoch),
      };
    }
    const slot = cred.slots.find((s) => s.memberId === state.me);
    if (!slot) return { username: "(no personal secret set)", password: "" };
    return {
      username: dec(slot.cipherUsername, team.teamKey, team.epoch),
      password: dec(slot.cipherPassword, team.teamKey, team.epoch),
    };
  },
};

export function memberAlias(id: string) {
  return state.members.find((m) => m.id === id)?.alias ?? id;
}
