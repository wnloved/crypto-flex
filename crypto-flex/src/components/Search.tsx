import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  type: "user" | "wallet" | "token";
  id?: number;
  address?: string;
  name?: string;
  symbol?: string;
  username?: string;
  chainId?: string;
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("Token");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3000/search?q=${encodeURIComponent(query)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const json = await res.json();
        setResults(json);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");

    switch (result.type) {
      case "user":
        navigate(`/wallet/${result.id}`);
        break;
      case "token":
        navigate(`/token/${result.chainId}/${result.address}`);
        break;
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search users, wallets, tokens..."
          className="w-[300px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1c1f] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
              {}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm
                ${
                  r.type === "user"
                    ? "bg-blue-600/20 text-blue-400"
                    : r.type === "wallet"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {r.type === "user" ? "👤" : r.type === "wallet" ? "💳" : "🪙"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {r.type === "user" ? r.username : r.name || r.symbol}
                </div>
                <div className="text-xs text-gray-500">
                  {r.type === "user"
                    ? `User #${r.id}`
                    : r.type === "wallet"
                      ? formatAddress(r.address || "")
                      : `Token · ${r.symbol}`}
                </div>
              </div>

              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0
                ${
                  r.type === "user"
                    ? "bg-blue-600/20 text-blue-400"
                    : r.type === "wallet"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {r.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1c1f] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl p-4 text-center text-gray-500 text-sm">
          Nothing found for "{query}"
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
