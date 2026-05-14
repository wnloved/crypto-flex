import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Contact {
  id: number;
  contactId: number;
  nickname: string;
  note?: string;
  contact: {
    id: number;
    username: string;
    avatar?: string;
    bio?: string;
    wallets: {
      id: number;
      wltAdress: string;
      name: string;
    }[];
  };
}

const DEFAULT_AVATAR = "http://localhost:5173/anon.png";

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("Token");

  useEffect(() => {
    getContacts();
  }, []);

  async function getContacts() {
    try {
      const res = await fetch("http://localhost:3000/contacts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      const enrichedContacts = await Promise.all(
        json.map(async (c: any) => {
          try {
            const [userRes, walletsRes] = await Promise.all([
              fetch(`http://localhost:3000/user/info/${c.contactId}`),
              fetch(`http://localhost:3000/user/wallets/${c.contactId}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            const user = userRes.ok ? await userRes.json() : null;
            const wallets = walletsRes.ok ? await walletsRes.json() : [];

            return {
              id: c.id,
              contactId: c.contactId,
              nickname: c.nickname,
              note: c.description || c.note,
              contact: {
                id: c.contactId,
                username: user?.username || "Unknown",
                avatar: user?.avatar || null,
                bio: user?.bio || "",
                wallets: wallets,
              },
            };
          } catch {
            return {
              id: c.id,
              contactId: c.contactId,
              nickname: c.nickname,
              note: c.description || c.note,
              contact: {
                id: c.contactId,
                username: "Unknown",
                avatar: null,
                bio: "",
                wallets: [],
              },
            };
          }
        }),
      );

      setContacts(enrichedContacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.nickname?.toLowerCase().includes(q) ||
      c.contact?.username?.toLowerCase().includes(q) ||
      c.contact?.wallets?.some((w) => w.wltAdress.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (contactId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this contact?")) return;

    try {
      await fetch(`http://localhost:3000/contacts/${contactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const openEditModal = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContact(contact);
    setEditName(contact.nickname || "");
    setEditNote(contact.note || "");
  };

  const handleUpdateContact = async () => {
    if (!editingContact || !editName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:3000/contacts/${editingContact.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nickname: editName.trim(),
            description: editNote.trim() || null,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update contact");

      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContact.id
            ? { ...c, nickname: editName.trim(), note: editNote.trim() || "" }
            : c,
        ),
      );
      setEditingContact(null);
    } catch (error) {
      console.error("Failed to update contact:", error);
      alert("Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return DEFAULT_AVATAR;
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:3000${avatar}`;
  };

  return (
    <div className="min-h-screen bg-[#151719] text-white">
      <div className="container mx-auto px-6 py-8 mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Contacts</h1>
            <p className="text-gray-400 mt-1">Your address book</p>
          </div>
          <div className="text-gray-400 text-sm">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or address..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg
              className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-gray-500 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl">
            <p className="text-5xl mb-4">📇</p>
            <p className="text-gray-400 text-lg">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </p>
            <p className="text-gray-500 mt-2">
              {searchQuery
                ? "Try different search"
                : "Add contacts from user profiles"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
              >
                {}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(contact.contact?.avatar)}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        alt={contact.nickname}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                        }}
                      />
                      <div>
                        {}
                        <Link
                          to={`/wallet/${contact.contact.id}`}
                          className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          {contact.nickname ||
                            contact.contact?.username ||
                            "Unknown"}
                        </Link>
                        {contact.note && (
                          <p className="text-xs text-gray-500 italic mt-0.5">
                            {contact.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditModal(contact, e)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(contact.id, e)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {}
                <div className="border-t border-white/5">
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === contact.id ? null : contact.id,
                      )
                    }
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <span>
                      {contact.contact?.wallets?.length || 0} wallet
                      {(contact.contact?.wallets?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedId === contact.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {expandedId === contact.id && (
                    <div className="px-5 pb-3 space-y-1">
                      {contact.contact?.wallets?.map((wallet) => (
                        <div
                          key={wallet.id}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/5 group/addr"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                          <span className="text-xs text-gray-300 flex-1">
                            {wallet.name || "Wallet"}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {formatAddress(wallet.wltAdress)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(wallet.wltAdress)}
                            className="opacity-0 group-hover/addr:opacity-100 p-1 hover:bg-white/10 rounded transition-all flex-shrink-0"
                            title="Copy"
                          >
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {editingContact && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1c1f] rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Contact</h2>
              <button
                onClick={() => setEditingContact(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Vitalik"
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="ETH God"
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingContact(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateContact}
                  disabled={saving || !editName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;
