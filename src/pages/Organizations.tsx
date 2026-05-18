import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Plus, Users, Key, Trash2, Eye, EyeOff, Crown,
  UserPlus, Shield, ShieldCheck, ScrollText, RefreshCw, Link2, Lock, Pencil, X, Copy, Check,
  MoreVertical, ChevronDown,
} from "lucide-react";
import {
  actions, useOrgsStore, getMyRole, memberAlias,
  type Role, type Organization, type Team, type Credential,
} from "@/lib/orgs-store";

const ROLE_COLORS: Record<Role, string> = {
  ORG_ADMIN: "bg-primary/15 text-primary border-primary/30",
  TEAM_ADMIN: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  MEMBER: "bg-muted text-foreground border-border",
  VIEWER: "bg-muted/50 text-muted-foreground border-border",
};
const ROLE_LABEL: Record<Role, string> = {
  ORG_ADMIN: "Org admin",
  TEAM_ADMIN: "Team admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export default function Organizations() {
  const navigate = useNavigate();
  const orgs = useOrgsStore((s) => s.orgs);
  const me = useOrgsStore((s) => s.me);
  const members = useOrgsStore((s) => s.members);
  const audit = useOrgsStore((s) => s.audit);

  const myOrgs = useMemo(
    () => orgs.filter((o) => o.ownerId === me || o.teams.some((t) => t.memberships.some((m) => m.memberId === me))),
    [orgs, me],
  );

  const [activeOrgId, setActiveOrgId] = useState<string | null>(myOrgs[0]?.id ?? null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(myOrgs[0]?.teams[0]?.id ?? null);
  const [tab, setTab] = useState<"members" | "shared" | "individual" | "audit">("shared");
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;
  const activeTeam = activeOrg?.teams.find((t) => t.id === activeTeamId) ?? null;
  const myRole: Role | null = activeTeam ? getMyRole(activeTeam, me) : null;
  const isOwner = activeOrg?.ownerId === me;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/vault")} className="p-2 -ml-2 rounded-lg hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold leading-none">Organizations</h1>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">Shared vaults & teams</p>
          </div>
          <IdentitySwitcher />
        </div>
      </header>

      {/* Mobile selectors */}
      <div className="lg:hidden border-b border-border/60 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
          <PickerRow
            icon={Building2}
            label="Organization"
            items={myOrgs.map((o) => ({ id: o.id, name: o.name, badge: o.ownerId === me ? "owner" : undefined }))}
            activeId={activeOrgId}
            onPick={(id) => {
              setActiveOrgId(id);
              const org = orgs.find((o) => o.id === id);
              setActiveTeamId(org?.teams[0]?.id ?? null);
            }}
            onAdd={() => setShowNewOrg(true)}
          />
          {activeOrg && (
            <PickerRow
              icon={Users}
              label="Team"
              items={activeOrg.teams
                .filter((t) => getMyRole(t, me) || isOwner)
                .map((t) => ({ id: t.id, name: t.name }))}
              activeId={activeTeamId}
              onPick={setActiveTeamId}
              onAdd={isOwner || activeOrg.teams.some((t) => getMyRole(t, me) === "ORG_ADMIN") ? () => setShowNewTeam(true) : undefined}
              emptyHint="No teams"
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Organizations</h2>
            <button onClick={() => setShowNewOrg(true)} className="p-1.5 rounded-md hover:bg-secondary/60 text-primary">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {myOrgs.map((o) => (
              <OrgRow
                key={o.id}
                org={o}
                active={o.id === activeOrgId}
                isOwner={o.ownerId === me}
                onClick={() => {
                  setActiveOrgId(o.id);
                  setActiveTeamId(o.teams[0]?.id ?? null);
                }}
              />
            ))}
            {myOrgs.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-4">No organizations yet.</p>
            )}
          </div>

          {activeOrg && (
            <>
              <div className="flex items-center justify-between px-1 pt-5">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Teams</h2>
                {(isOwner || activeOrg.teams.some((t) => getMyRole(t, me) === "ORG_ADMIN")) && (
                  <button onClick={() => setShowNewTeam(true)} className="p-1.5 rounded-md hover:bg-secondary/60 text-primary">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {activeOrg.teams.map((t) => {
                  const role = getMyRole(t, me);
                  if (!role && !isOwner) return null;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTeamId(t.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                        t.id === activeTeamId
                          ? "bg-primary/10 border-primary/30"
                          : "bg-card border-border hover:border-primary/20"
                      }`}
                    >
                      <span className="text-sm truncate">{t.name}</span>
                    </button>
                  );
                })}
                {activeOrg.teams.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3">No teams yet.</p>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0">
          {!activeOrg ? (
            <EmptyState icon={Building2} title="Create your first organization" hint="Owners can spin up teams and invite members." />
          ) : (
            <>
              <OrgHeader
                org={activeOrg}
                isOwner={isOwner}
                myRole={myRole}
                onDelete={() => {
                  if (confirm(`Delete "${activeOrg.name}"? This cascades all teams and credentials.`)) {
                    actions.deleteOrg(activeOrg.id);
                    setActiveOrgId(null);
                    setActiveTeamId(null);
                  }
                }}
                onTransfer={(toId) => actions.transferOwnership(activeOrg.id, toId)}
                members={members}
              />

              {activeTeam ? (
                <>
                  <TeamHeader
                    org={activeOrg}
                    team={activeTeam}
                    myRole={myRole}
                    isOwner={isOwner}
                    onDelete={async () => {
                      try {
                        await actions.deleteTeam(activeOrg.id, activeTeam.id);
                        setActiveTeamId(activeOrg.teams.find((t) => t.id !== activeTeam.id)?.id ?? null);
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                  />

                  <div className="flex items-center gap-0 mt-5 mb-4 border-b border-border overflow-x-auto">
                    {(
                      [
                        ["shared", "Shared", Key],
                        ["individual", "Personal", Lock],
                        ["members", "Members", Users],
                        ["audit", "Audit", ScrollText],
                      ] as const
                    ).map(([k, label, Icon]) => (
                      <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                          tab === k
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === "shared" && <SharedTab org={activeOrg} team={activeTeam} myRole={myRole} />}
                  {tab === "individual" && <IndividualTab org={activeOrg} team={activeTeam} myRole={myRole} />}
                  {tab === "members" && <MembersTab org={activeOrg} team={activeTeam} myRole={myRole} />}
                  {tab === "audit" && <AuditTab orgId={activeOrg.id} teamId={activeTeam.id} audit={audit} />}
                </>
              ) : (
                <EmptyState icon={Users} title="No team selected" hint="Create a team to start sharing credentials." />
              )}
            </>
          )}
        </main>
      </div>

      {showNewOrg && (
        <PromptModal
          title="New organization"
          label="Name"
          onClose={() => setShowNewOrg(false)}
          onSubmit={async (name) => {
            await actions.createOrg(name);
            setShowNewOrg(false);
          }}
        />
      )}
      {showNewTeam && activeOrg && (
        <PromptModal
          title={`New team in "${activeOrg.name}"`}
          label="Team name"
          onClose={() => setShowNewTeam(false)}
          onSubmit={async (name) => {
            await actions.createTeam(activeOrg.id, name);
            setShowNewTeam(false);
          }}
        />
      )}
    </div>
  );
}

// ---------- subcomponents ----------

function IdentitySwitcher() {
  const me = useOrgsStore((s) => s.me);
  const members = useOrgsStore((s) => s.members);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="hidden sm:block text-muted-foreground">Acting as</span>
      <select
        value={me}
        onChange={(e) => actions.setMe(e.target.value)}
        className="bg-card border border-border rounded-md px-2 py-1.5 text-xs"
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.alias}</option>
        ))}
      </select>
    </div>
  );
}

function OrgRow({ org, active, isOwner, onClick }: { org: Organization; active: boolean; isOwner: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors ${
        active ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/20"
      }`}
    >
      <Building2 className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm truncate flex-1">{org.name}</span>
      {isOwner && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
    </button>
  );
}

function PickerRow({
  icon: Icon, label, items, activeId, onPick, onAdd, emptyHint,
}: {
  icon: typeof Building2;
  label: string;
  items: { id: string; name: string; badge?: string }[];
  activeId: string | null;
  onPick: (id: string) => void;
  onAdd?: () => void;
  emptyHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = items.find((i) => i.id === activeId);
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors text-left min-w-0"
        >
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className="text-sm font-medium truncate flex-1">{active?.name ?? emptyHint ?? "—"}</span>
          {active?.badge && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {onAdd && (
          <button onClick={onAdd} className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 text-primary">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg p-1 max-h-64 overflow-y-auto">
          {items.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">{emptyHint ?? "Nothing here"}</p>}
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => { onPick(it.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm text-left ${
                it.id === activeId ? "bg-primary/10 text-primary" : "hover:bg-secondary"
              }`}
            >
              <span className="truncate flex-1">{it.name}</span>
              {it.badge && <Crown className="w-3 h-3 text-amber-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgHeader({
  org, isOwner, myRole, onDelete, onTransfer, members,
}: {
  org: Organization; isOwner: boolean; myRole: Role | null;
  onDelete: () => void; onTransfer: (toId: string) => void;
  members: { id: string; alias: string }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold flex items-center gap-2 truncate">
          {org.name}
          {isOwner && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-1">
          {org.teams.length} team{org.teams.length !== 1 ? "s" : ""} · owner {memberAlias(org.ownerId)}
        </p>
      </div>
      {isOwner && (
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen((v) => !v)} className="p-2 rounded-md hover:bg-secondary">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg p-1 w-52">
              <button
                onClick={() => { setTransferOpen(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs rounded hover:bg-secondary text-left"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Transfer ownership
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs rounded hover:bg-destructive/10 text-destructive text-left"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete organization
              </button>
            </div>
          )}
          {transferOpen && (
            <Modal title="Transfer ownership" onClose={() => setTransferOpen(false)}>
              <p className="text-xs text-muted-foreground mb-2">Choose the new owner:</p>
              <div className="space-y-1">
                {members.filter((m) => m.id !== org.ownerId).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onTransfer(m.id); setTransferOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary"
                  >
                    {m.alias}
                  </button>
                ))}
              </div>
            </Modal>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TeamHeader({ org, team, myRole, isOwner, onDelete }: { org: Organization; team: Team; myRole: Role | null; isOwner: boolean; onDelete: () => void }) {
  const canDelete = isOwner || myRole === "ORG_ADMIN";
  return (
    <div className="mt-4 flex items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2 min-w-0">
        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
        <h3 className="text-sm font-medium truncate">{team.name}</h3>
        {myRole && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${ROLE_COLORS[myRole]}`}>{ROLE_LABEL[myRole]}</span>
        )}
      </div>
      {canDelete && (
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 text-destructive shrink-0" title="Delete team">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function MembersTab({ org, team, myRole }: { org: Organization; team: Team; myRole: Role | null }) {
  const allMembers = useOrgsStore((s) => s.members);
  const me = useOrgsStore((s) => s.me);
  const isOwner = org.ownerId === me;
  const canManage = isOwner || myRole === "ORG_ADMIN" || myRole === "TEAM_ADMIN";
  const [inviteOpen, setInviteOpen] = useState(false);

  const available = allMembers.filter((m) => !team.memberships.find((mm) => mm.memberId === m.id));

  const setRole = (memberId: string, role: Role) => {
    if (!myRole) return;
    actions.changeRole(org.id, team.id, memberId, role, myRole);
  };

  const roleOptions: Role[] =
    myRole === "ORG_ADMIN" || isOwner
      ? ["ORG_ADMIN", "TEAM_ADMIN", "MEMBER", "VIEWER"]
      : myRole === "TEAM_ADMIN"
      ? ["MEMBER", "VIEWER"]
      : [];

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{team.memberships.length} member{team.memberships.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => setInviteOpen((v) => !v)}
            disabled={available.length === 0}
            className="px-2.5 py-1.5 rounded-md text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <UserPlus className="w-3 h-3" /> Invite
          </button>
        </div>
      )}

      {inviteOpen && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          {available.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono">{m.alias}</span>
              <div className="flex items-center gap-1">
                {(roleOptions.length ? roleOptions : (["MEMBER"] as Role[])).map((r) => (
                  <button
                    key={r}
                    onClick={() => { actions.inviteMember(org.id, team.id, m.id, r); setInviteOpen(false); }}
                    className={`px-2 py-1 rounded border text-[10px] ${ROLE_COLORS[r]}`}
                  >
                    + {r}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {available.length === 0 && <p className="text-xs text-muted-foreground">Everyone is already in this team.</p>}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {team.memberships.map((m) => {
          const member = allMembers.find((x) => x.id === m.memberId);
          const isMe = m.memberId === me;
          return (
            <div key={m.memberId} className="flex items-center gap-3 p-3 bg-card">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-mono">
                {member?.alias.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm flex items-center gap-2">
                  <span className="font-mono">{member?.alias}</span>
                  {isMe && <span className="text-[10px] text-primary">(you)</span>}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">wrap: {m.wrappedKey.slice(0, 28)}…</p>
              </div>
              {canManage && roleOptions.length > 0 ? (
                <select
                  value={m.role}
                  onChange={(e) => setRole(m.memberId, e.target.value as Role)}
                  className="bg-secondary border border-border rounded px-1.5 py-1 text-[11px]"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  {!roleOptions.includes(m.role) && <option value={m.role}>{m.role}</option>}
                </select>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ROLE_COLORS[m.role]}`}>{m.role}</span>
              )}
              {(canManage || isMe) && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${member?.alias} from team? Team Key will rotate.`))
                      actions.removeMember(org.id, team.id, m.memberId);
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                  title="Remove + rotate key"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SharedTab({ org, team, myRole }: { org: Organization; team: Team; myRole: Role | null }) {
  const [addOpen, setAddOpen] = useState(false);
  const canWrite = myRole === "ORG_ADMIN" || myRole === "TEAM_ADMIN" || myRole === "MEMBER";
  const list = team.credentials.filter((c) => c.kind === "SHARED");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{list.filter((c) => !c.deleted).length} active · encrypted with Team Key</p>
        {canWrite && (
          <button onClick={() => setAddOpen(true)} className="px-2.5 py-1.5 rounded-md text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> New shared
          </button>
        )}
      </div>
      <div className="grid gap-2.5">
        {list.map((c) => (
          <CredentialRow key={c.id} org={org} team={team} cred={c} myRole={myRole} />
        ))}
        {list.length === 0 && <EmptyState icon={Key} title="No shared credentials" hint="Create one to share with the team." compact />}
      </div>

      {addOpen && (
        <CredentialForm
          title="New shared credential"
          requireSecret
          onClose={() => setAddOpen(false)}
          onSubmit={async (v) => {
            await actions.createSharedCredential(org.id, team.id, v.title, v.username, v.password, v.url, v.notes);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function IndividualTab({ org, team, myRole }: { org: Organization; team: Team; myRole: Role | null }) {
  const [addOpen, setAddOpen] = useState(false);
  const canWriteTemplate = myRole === "ORG_ADMIN" || myRole === "TEAM_ADMIN";
  const list = team.credentials.filter((c) => c.kind === "INDIVIDUAL");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Templates — each member sets their own secret</p>
        {canWriteTemplate && (
          <button onClick={() => setAddOpen(true)} className="px-2.5 py-1.5 rounded-md text-xs bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> New template
          </button>
        )}
      </div>
      <div className="grid gap-2.5">
        {list.map((c) => (
          <CredentialRow key={c.id} org={org} team={team} cred={c} myRole={myRole} />
        ))}
        {list.length === 0 && <EmptyState icon={Lock} title="No individual templates" hint="Admins create templates; members fill in their own secret." compact />}
      </div>

      {addOpen && (
        <CredentialForm
          title="New individual template"
          requireSecret={false}
          onClose={() => setAddOpen(false)}
          onSubmit={async (v) => {
            await actions.createIndividualTemplate(org.id, team.id, v.title, v.url, v.notes);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CredentialRow({ org, team, cred, myRole }: { org: Organization; team: Team; cred: Credential; myRole: Role | null }) {
  const me = useOrgsStore((s) => s.me);
  const [revealed, setRevealed] = useState<null | { username: string; password: string }>(null);
  const [editing, setEditing] = useState(false);
  const [settingSecret, setSettingSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const canWrite = myRole === "ORG_ADMIN" || myRole === "TEAM_ADMIN" || myRole === "MEMBER";
  const canDelete = myRole === "ORG_ADMIN" || myRole === "TEAM_ADMIN";
  const hasMySlot = cred.kind === "INDIVIDUAL" && cred.slots.some((s) => s.memberId === me);

  if (cred.deleted) {
    return (
      <div className="p-3 rounded-xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground flex items-center justify-between">
        <span><Trash2 className="w-3 h-3 inline mr-2" />{cred.title} — sensitive data purged, metadata kept</span>
        <span className="font-mono">{cred.id}</span>
      </div>
    );
  }

  const reveal = async () => {
    const r = await actions.revealCredential(org.id, team.id, cred.id);
    if (r) setRevealed(r);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cred.kind === "SHARED" ? "bg-primary/15" : "bg-blue-500/15"}`}>
            {cred.kind === "SHARED" ? <Key className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
              {cred.title}
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${cred.kind === "SHARED" ? "bg-primary/10 border-primary/30 text-primary" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`}>
                {cred.kind}
              </span>
              {cred.kind === "INDIVIDUAL" && !hasMySlot && (
                <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400">Not set</span>
              )}
            </p>
            {cred.url && (
              <a href={cred.url} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 truncate">
                <Link2 className="w-3 h-3" /> {cred.url}
              </a>
            )}
            {cred.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{cred.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {cred.kind === "INDIVIDUAL" && canWrite && (
            <button onClick={() => setSettingSecret(true)} className="p-1.5 rounded hover:bg-secondary" title="Set my secret">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </button>
          )}
          <button onClick={revealed ? () => setRevealed(null) : reveal} className="p-1.5 rounded hover:bg-secondary" title="Reveal">
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          {canWrite && (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-secondary" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => { if (confirm("Hybrid delete: secrets wiped, metadata kept. Continue?")) actions.deleteCredential(org.id, team.id, cred.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {revealed && (
        <div className="mt-3 p-2.5 rounded-lg bg-background/60 border border-border space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">user:</span>
            <span className="flex-1 truncate">{revealed.username || "—"}</span>
            <button onClick={() => copy(revealed.username)} className="p-1 rounded hover:bg-secondary">
              {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">pass:</span>
            <span className="flex-1 truncate">{revealed.password || "—"}</span>
            <button onClick={() => copy(revealed.password)} className="p-1 rounded hover:bg-secondary">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      {editing && (
        <CredentialForm
          title={`Edit "${cred.title}"`}
          requireSecret={cred.kind === "SHARED"}
          initial={{ title: cred.title, url: cred.url ?? "", notes: cred.notes ?? "" }}
          metaOnly={cred.kind === "INDIVIDUAL"}
          onClose={() => setEditing(false)}
          onSubmit={async (v) => {
            await actions.updateCredentialMeta(org.id, team.id, cred.id, { title: v.title, url: v.url, notes: v.notes });
            if (cred.kind === "SHARED" && v.password) {
              await actions.updateSharedSecret(org.id, team.id, cred.id, v.username, v.password);
            }
            setEditing(false);
          }}
        />
      )}
      {settingSecret && (
        <CredentialForm
          title="Set my personal secret"
          requireSecret
          metaOnly={false}
          hideMeta
          onClose={() => setSettingSecret(false)}
          onSubmit={async (v) => {
            await actions.setIndividualSecret(org.id, team.id, cred.id, v.username, v.password);
            setSettingSecret(false);
          }}
        />
      )}
    </motion.div>
  );
}

function AuditTab({ orgId, teamId, audit }: { orgId: string; teamId: string; audit: import("@/lib/orgs-store").AuditEntry[] }) {
  const list = audit.filter((a) => (!a.orgId || a.orgId === orgId) && (!a.teamId || a.teamId === teamId));
  const [showHash, setShowHash] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{list.length} event{list.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowHash((v) => !v)}
          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {showHash ? "Hide" : "Show"} chain hashes
        </button>
      </div>
      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
        {list.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">No events yet.</div>
        )}
        {list.map((a) => (
          <div key={a.id} className="p-3 flex items-start gap-3">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${a.channel === "chain" ? "bg-purple-500/15 text-purple-400" : "bg-primary/10 text-primary"}`}>
              {a.channel === "chain" ? <Shield className="w-3.5 h-3.5" /> : <ScrollText className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium flex items-center gap-2 flex-wrap">
                <span>{a.event.toLowerCase().replace(/_/g, " ")}</span>
                <span className="text-[10px] text-muted-foreground">· {memberAlias(a.actorId)}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.details}</p>
              {showHash && a.hash && (
                <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5 truncate">
                  {a.hash.slice(0, 16)}…{a.prevHash ? ` ← ${a.prevHash.slice(0, 10)}…` : " (genesis)"}
                </p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{a.ts.toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptModal({ title, label, onClose, onSubmit }: { title: string; label: string; onClose: () => void; onSubmit: (v: string) => void | Promise<void> }) {
  const [val, setVal] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={label}
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary/40"
      />
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md hover:bg-secondary">Cancel</button>
        <button
          disabled={!val.trim()}
          onClick={() => val.trim() && onSubmit(val.trim())}
          className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </Modal>
  );
}

function CredentialForm({
  title, requireSecret, initial, metaOnly, hideMeta, onClose, onSubmit,
}: {
  title: string;
  requireSecret: boolean;
  initial?: { title?: string; url?: string; notes?: string };
  metaOnly?: boolean;
  hideMeta?: boolean;
  onClose: () => void;
  onSubmit: (v: { title: string; url?: string; notes?: string; username: string; password: string }) => void | Promise<void>;
}) {
  const [t, setT] = useState(initial?.title ?? "");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const canSubmit = (hideMeta || t.trim()) && (!requireSecret || (u.trim() && p.trim()));

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-2">
        {!hideMeta && (
          <>
            <Field label="Title">
              <input value={t} onChange={(e) => setT(e.target.value)} className={inputCls} />
            </Field>
            <Field label="URL">
              <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Notes">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
            </Field>
          </>
        )}
        {!metaOnly && (
          <>
            <Field label="Username">
              <input value={u} onChange={(e) => setU(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Password">
              <input value={p} onChange={(e) => setP(e.target.value)} className={inputCls} />
            </Field>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-md hover:bg-secondary">Cancel</button>
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit({ title: t.trim(), url: url.trim() || undefined, notes: notes.trim() || undefined, username: u, password: p })}
          className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

const inputCls = "w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-primary/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-xl p-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint, compact }: { icon: typeof Building2; title: string; hint?: string; compact?: boolean }) {
  return (
    <div className={`text-center ${compact ? "py-8" : "py-16"}`}>
      <Icon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
