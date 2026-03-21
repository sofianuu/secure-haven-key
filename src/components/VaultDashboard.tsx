import { useState, useMemo } from "react";
import { Search, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { PasswordEntry } from "@/lib/password-store";
import { CATEGORIES, evaluateStrength, getDemoPasswords, getDemoKeys } from "@/lib/password-store";
import Sidebar from "./Sidebar";
import PasswordCard from "./PasswordCard";
import AddEditModal from "./AddEditModal";
import PasswordGenerator from "./PasswordGenerator";
import WalletView from "./WalletView";

type View = 'vault' | 'favorites' | 'wallet' | 'generator';

export default function VaultDashboard() {
  const [entries, setEntries] = useState<PasswordEntry[]>(getDemoPasswords);
  const [keys] = useState<CryptoKey[]>(getDemoKeys);
  const [view, setView] = useState<View>('vault');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);

  const filtered = useMemo(() => {
    let list = view === 'favorites' ? entries.filter((e) => e.favorite) : entries;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.username.toLowerCase().includes(q));
    }
    if (filterCategory !== 'all') {
      list = list.filter((e) => e.category === filterCategory);
    }
    return list;
  }, [entries, view, search, filterCategory]);

  const handleSave = (data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength'>) => {
    if (editEntry) {
      setEntries((prev) => prev.map((e) => e.id === editEntry.id ? { ...e, ...data, strength: evaluateStrength(data.password), updatedAt: new Date() } : e));
    } else {
      const newEntry: PasswordEntry = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        strength: evaluateStrength(data.password),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
    setEditEntry(null);
  };

  const handleDelete = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const handleToggleFavorite = (id: string) => setEntries((prev) => prev.map((e) => e.id === id ? { ...e, favorite: !e.favorite } : e));

  const openAdd = () => { setEditEntry(null); setModalOpen(true); };
  const openEdit = (entry: PasswordEntry) => { setEditEntry(entry); setModalOpen(true); };

  const counts = {
    total: entries.length,
    favorites: entries.filter((e) => e.favorite).length,
    keys: keys.length,
  };

  return (
    <div className="flex h-screen bg-background bg-grid">
      <Sidebar activeView={view} onViewChange={setView} onAddNew={openAdd} counts={counts} />

      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {(view === 'vault' || view === 'favorites') && (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">
                    {view === 'favorites' ? 'Favorites' : 'Password Vault'}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    {filtered.length} credential{filtered.length !== 1 ? 's' : ''} stored securely
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border focus-within:border-primary/30 transition-colors">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search vault..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                      filterCategory === 'all' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card text-muted-foreground border border-border hover:border-primary/20'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFilterCategory(cat.value)}
                      className={`px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                        filterCategory === cat.value ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card text-muted-foreground border border-border hover:border-primary/20'
                      }`}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {filtered.map((entry, i) => (
                    <PasswordCard
                      key={entry.id}
                      entry={entry}
                      index={i}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No credentials found</p>
                </motion.div>
              )}
            </>
          )}

          {view === 'wallet' && <WalletView keys={keys} />}
          {view === 'generator' && <PasswordGenerator />}
        </div>
      </main>

      <AddEditModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditEntry(null); }} onSave={handleSave} editEntry={editEntry} />
    </div>
  );
}
