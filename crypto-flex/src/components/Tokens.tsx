import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Token {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  price?: number;
  chainId: number;
  chain?: {
    id: number;
    name: string;
    symbol: string;
  };
}

interface Chain {
  id: number;
  chainId: number;
  name: string;
  symbol: string;
}

function Tokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("all");
  const [chains, setChains] = useState<Chain[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  useEffect(() => {
    fetchTokens();
    fetchChains();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch(`http://localhost:3000/token/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      setTokens(json);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const res = await fetch("http://localhost:3000/chain/getAll");
      const json = await res.json();
      setChains(json);
    } catch (error) {
      console.error("Failed to fetch chains:", error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getLogoUrl = (logo?: string) => {
    if (!logo) return "./ava.jpg";
    if (logo.startsWith("http")) return logo;
    return `http://localhost:3000${logo}`;
  };

  const filteredTokens = tokens
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q);
      const matchChain =
        selectedChain === "all" || t.chainId === Number(selectedChain);
      return matchSearch && matchChain;
    })
    .sort((a, b) => {
      const aVal = sortBy === "name" ? a.name.toLowerCase() : a.price || 0;
      const bVal = sortBy === "name" ? b.name.toLowerCase() : b.price || 0;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#151719] text-white">
      <div className="container mx-auto px-6 py-8 mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Tokens</h1>
            <p className="text-gray-400 mt-1">Explore all tokens</p>
          </div>
          <div className="text-gray-400 text-sm">
            {filteredTokens.length} token
            {filteredTokens.length !== 1 ? "s" : ""}
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, symbol or address..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all" className="bg-[#151719]">
              All Chains
            </option>
            {chains.map((chain) => (
              <option
                key={chain.id}
                value={chain.chainId}
                className="bg-[#151719]"
              >
                {chain.name}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split("-");
              setSortBy(by as "name" | "price");
              setSortOrder(order as "asc" | "desc");
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="name-asc" className="bg-[#151719]">
              Name A-Z
            </option>
            <option value="name-desc" className="bg-[#151719]">
              Name Z-A
            </option>
            <option value="price-desc" className="bg-[#151719]">
              Price: High to Low
            </option>
            <option value="price-asc" className="bg-[#151719]">
              Price: Low to High
            </option>
          </select>
        </div>

        {}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl">
            <p className="text-5xl mb-4">🪙</p>
            <p className="text-gray-400 text-lg">
              {searchQuery || selectedChain !== "all"
                ? "No tokens found"
                : "No tokens yet"}
            </p>
            <p className="text-gray-500 mt-2">
              {searchQuery || selectedChain !== "all"
                ? "Try different filters"
                : "Add tokens to start tracking"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                onClick={() =>
                  navigate(
                    `/token/0x${token.chainId.toString(16)}/${token.address}`,
                  )
                }
                className="bg-white/5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all cursor-pointer group p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getLogoUrl(token.logo)}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    alt={token.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "./ava.jpg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{token.name}</h3>
                    <p className="text-sm text-gray-400">{token.symbol}</p>
                  </div>
                  {token.price && (
                    <span className="text-green-400 text-sm font-medium flex-shrink-0">
                      ${token.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Address</span>
                    <span className="text-gray-400 font-mono">
                      {formatAddress(token.address)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Chain</span>
                    <span className="text-gray-400">{token.chain?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Decimals</span>
                    <span className="text-gray-400">{token.decimals}</span>
                  </div>
                  {token.price && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Price</span>
                      <span className="text-green-400">
                        ${token.price.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tokens;
