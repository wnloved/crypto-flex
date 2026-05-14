import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface TokenInfo {
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
    explorerUrl?: string;
  };
  totalSupply?: string;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
}

function TokenPage() {
  const { address, chain } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "holders" | "transfers">(
    "info",
  );
  const [isTracked, setIsTracked] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const authToken = localStorage.getItem("Token");

  useEffect(() => {
    if (address && chain) {
      fetchToken();
      checkIfTracked();
    }
  }, [address, chain]);

  const fetchToken = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/token/${chain}/${address}`,
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        },
      );
      if (!res.ok) throw new Error("Token not found");
      const json = await res.json();
      setToken(json);
    } catch (error) {
      console.error("Failed to fetch token:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfTracked = async () => {
    if (!authToken) return;
    const walletAddress = localStorage.getItem("userAddress");
    if (!walletAddress) return;

    try {
      const res = await fetch(
        `http://localhost:3000/token/tracked/${walletAddress}/${chain}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      const json = await res.json();

      setIsTracked(
        json.some(
          (t: any) => t.address?.toLowerCase() === address?.toLowerCase(),
        ),
      );
    } catch (error) {
      console.error("Failed to check tracked:", error);
    }
  };

  const handleToggleTrack = async () => {
    if (!authToken) {
      alert("Connect wallet first");
      return;
    }

    const walletAddress = localStorage.getItem("userAddress");
    if (!walletAddress) {
      alert("No wallet connected");
      return;
    }

    setTrackingLoading(true);
    try {
      if (isTracked) {
        await fetch(
          `http://localhost:3000/token/track/${walletAddress}/${chain}/${address}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
        setIsTracked(false);
      } else {
        await fetch(
          `http://localhost:3000/token/track/${walletAddress}/${chain}/${address}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        setIsTracked(true);
      }
    } catch (error) {
      console.error("Failed to toggle track:", error);
    } finally {
      setTrackingLoading(false);
    }
  };
  const formatNumber = (num?: number) => {
    if (!num) return "---";
    if (num > 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num > 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num > 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getLogoUrl = (logo?: string) => {
    if (!logo) return "./ava.jpg";
    if (logo.startsWith("http")) return logo;
    return `http://localhost:3000${logo}`;
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151719] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#151719] flex flex-col items-center justify-center text-white">
        <p className="text-5xl mb-4">🪙</p>
        <p className="text-xl text-gray-400">Token not found</p>
        <button
          onClick={() => navigate("/tokens")}
          className="mt-4 px-5 py-2 bg-blue-600 rounded-xl text-sm"
        >
          Back to Tokens
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151719] text-white">
      <div className="container mx-auto px-6 py-8 mt-20">
        {}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/tokens")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <img
            src={getLogoUrl(token.logo)}
            className="w-14 h-14 rounded-full object-cover"
            alt={token.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "./ava.jpg";
            }}
          />
          <div>
            <h1 className="text-3xl font-bold">{token.name}</h1>
            <p className="text-gray-400">{token.symbol}</p>
          </div>
          {}
          <button
            onClick={handleToggleTrack}
            disabled={trackingLoading}
            className=" mb-5 p-2 rounded-xl hover:bg-white/5 transition-colors"
            title={isTracked ? "Remove from tracked" : "Add to tracked"}
          >
            {trackingLoading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className={`w-6 h-6 transition-colors ${isTracked ? "text-yellow-400 fill-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
                fill={isTracked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            )}
          </button>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Price</p>
            <p className="text-2xl font-bold">
              ${token.price?.toFixed(4) || "---"}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Market Cap</p>
            <p className="text-2xl font-bold">
              {formatNumber(token.marketCap)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">24h Volume</p>
            <p className="text-2xl font-bold">
              {formatNumber(token.volume24h)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">24h Change</p>
            <p
              className={`text-2xl font-bold ${(token.priceChange24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {token.priceChange24h
                ? `${token.priceChange24h >= 0 ? "+" : ""}${token.priceChange24h.toFixed(2)}%`
                : "---"}
            </p>
          </div>
        </div>

        {}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {(["info", "holders", "transfers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors relative
                ${activeTab === tab ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {}
        {activeTab === "info" && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-white/5 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Token Info</h2>
              <div className="space-y-3">
                <InfoRow label="Name" value={token.name} />
                <InfoRow label="Symbol" value={token.symbol} />
                <InfoRow label="Decimals" value={token.decimals.toString()} />
                <InfoRow
                  label="Chain"
                  value={token.chain?.name || `Chain #${token.chainId}`}
                />
                <InfoRow
                  label="Total Supply"
                  value={token.totalSupply || "---"}
                />
                <InfoRow
                  label="Contract Address"
                  value={token.address}
                  isAddress
                  onCopy={() => copyToClipboard(token.address)}
                />
              </div>
            </div>

            {token.chain?.explorerUrl && (
              <a
                href={`${token.chain.explorerUrl}/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                View on Explorer ↗
              </a>
            )}
          </div>
        )}

        {activeTab === "holders" && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p>Holders list coming soon</p>
          </div>
        )}

        {activeTab === "transfers" && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p>Transfer history coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isAddress,
  onCopy,
}: {
  label: string;
  value: string;
  isAddress?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${isAddress ? "font-mono text-blue-400" : ""}`}
        >
          {isAddress ? formatAddress(value) : value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Copy"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-400"
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
        )}
      </div>
    </div>
  );
}

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default TokenPage;
