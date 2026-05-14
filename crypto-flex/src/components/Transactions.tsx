import { useState, useEffect } from "react";
import { useSyncProviders } from "../hooks/useSyncProviders";
import { formatAddress } from "../utils";
import { ethers } from "ethers";

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  blockNumber?: number;
}

interface TrackedToken {
  id: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
}

interface Chain {
  id: number;
  chainId: number;
  name: string;
  symbol: string;
  chainIdHex?: string;
}

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackedTokens, setTrackedTokens] = useState<TrackedToken[]>([]);
  const [sending, setSending] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChainHex, setSelectedChainHex] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [txForm, setTxForm] = useState({
    toAddress: "",
    amount: "",
    tokenId: "",
    chainId: 1,
  });

  const wallet = localStorage.getItem("userAddress");
  const token = localStorage.getItem("Token");
  const providers = useSyncProviders();

  useEffect(() => {
    fetchTransactions();
    fetchChains();
  }, []);

  const fetchTransactions = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/transactions/${wallet}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      const formatted = json.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        from: tx.fromWalletId || "Unknown",
        to: tx.toWalletId || "Unknown",
        value: tx.value,
        token: tx.token || "ETH",
        status: tx.status,
        timestamp: tx.createdAt,
        blockNumber: tx.blockNumber,
      }));

      setTransactions(formatted);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const res = await fetch("http://localhost:3000/chain/getAll");
      const json = await res.json();
      const chainsWithHex = json.map((chain: any) => ({
        ...chain,
        chainIdHex: "0x" + chain.chainId.toString(16),
      }));
      setChains(chainsWithHex);
    } catch (error) {
      console.error("Failed to fetch chains:", error);
    }
  };

  const fetchTrackedTokens = async (chainHex: string) => {
    if (!wallet || !token) return;
    try {
      const res = await fetch(
        `http://localhost:3000/token/tracked/${wallet}/${chainHex}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      setTrackedTokens(json);
    } catch (error) {
      console.error("Failed to fetch tracked tokens:", error);
    }
  };

  const handleSendTransaction = async () => {
    if (!txForm.toAddress || !txForm.amount || !selectedTokenId) {
      alert("Fill all fields");
      return;
    }

    if (providers.length === 0) {
      alert("No wallet detected. Please install MetaMask.");
      return;
    }

    setSending(true);
    try {
      const provider = providers[0].provider;
      const selectedToken = trackedTokens.find(
        (t) => t.id.toString() === selectedTokenId,
      );
      if (!selectedToken) throw new Error("Token not found");

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      let tx;
      if (selectedToken.symbol === "ETH") {
        tx = await signer.sendTransaction({
          to: txForm.toAddress,
          value: ethers.parseEther(txForm.amount),
        });
      } else {
        const contract = new ethers.Contract(
          selectedToken.address,
          ["function transfer(address to, uint256 amount) returns (bool)"],
          signer,
        );
        const amount = ethers.parseUnits(txForm.amount, selectedToken.decimals);
        tx = await contract.transfer(txForm.toAddress, amount);
      }

      const receipt = await tx.wait();

      const chainIdNum = parseInt(selectedChainHex, 16);

      await fetch("http://localhost:3000/transactions/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hash: tx.hash,
          fromAddress: wallet,
          toAddress: txForm.toAddress,
          amount: txForm.amount,
          tokenId: selectedToken.id,
          chainId: chainIdNum,
          status: receipt.status === 1 ? "confirmed" : "failed",
          blockNumber: receipt.blockNumber,
          createdAt: Math.floor(Date.now() / 1000),
        }),
      });

      setIsModalOpen(false);
      setTxForm({ toAddress: "", amount: "", tokenId: "", chainId: 1 });
      setSelectedChainHex("");
      setSelectedTokenId("");
      setTrackedTokens([]);
      await fetchTransactions();
      alert("Transaction sent successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed: " + (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "incoming") return tx.to === wallet;
    if (filter === "outgoing") return tx.from === wallet;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const totalCount = filteredTransactions.length;

  return (
    <div className="min-h-screen bg-[#151719] text-white">
      <div className="container mx-auto px-6 py-8 mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Transactions</h1>
            <p className="text-gray-400 mt-1">
              All your transactions in one place
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl transition-colors flex items-center gap-2 font-medium"
            >
              <span className="text-xl">+</span>
              Send
            </button>
            <button
              onClick={fetchTransactions}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 font-medium"
            >
              <span className="text-xl">↻</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Outgoing</p>
            <p className="text-2xl font-bold text-red-400">
              {transactions.filter((t) => t.from === wallet).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Incoming</p>
            <p className="text-2xl font-bold text-green-400">
              {transactions.filter((t) => t.to === wallet).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Chains</p>
            <p className="text-2xl font-bold">3+</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["all", "incoming", "outgoing"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`
                px-5 py-2 rounded-xl capitalize transition-colors font-medium
                ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      From/To
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Token
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                      TX
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={
                            tx.from === wallet
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {tx.from === wallet ? "↗️ OUT" : "↙️ IN"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-300">
                            From: {formatAddress(tx.from) || tx.from}
                          </div>
                          <div className="text-gray-300">
                            To: {formatAddress(tx.to) || tx.to}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{tx.value}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono">{tx.token}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`${getStatusColor(tx.status)} capitalize`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p>No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1c1f] rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Send Transaction</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Network
                </label>
                <select
                  value={selectedChainHex}
                  onChange={(e) => {
                    setSelectedChainHex(e.target.value);
                    setSelectedTokenId("");
                    setTxForm({
                      ...txForm,
                      toAddress: "",
                      amount: "",
                      tokenId: "",
                    });
                    if (e.target.value) {
                      fetchTrackedTokens(e.target.value);
                    }
                  }}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Select network
                  </option>
                  {chains.map((chain) => (
                    <option
                      key={chain.id}
                      value={chain.chainIdHex}
                      className="bg-gray-800 text-white"
                    >
                      {chain.name} ({chain.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {}
              {selectedChainHex && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Token
                  </label>
                  <select
                    value={selectedTokenId}
                    onChange={(e) => setSelectedTokenId(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="" className="bg-gray-800 text-white">
                      Select token
                    </option>
                    {trackedTokens.map((t) => (
                      <option
                        key={t.id}
                        value={t.id.toString()}
                        className="bg-gray-800 text-white"
                      >
                        {t.symbol} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {}
              {selectedTokenId && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={txForm.toAddress}
                      onChange={(e) =>
                        setTxForm({ ...txForm, toAddress: e.target.value })
                      }
                      placeholder="0x..."
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={txForm.amount}
                      onChange={(e) =>
                        setTxForm({ ...txForm, amount: e.target.value })
                      }
                      placeholder="0.0"
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                    />
                  </div>

                  <button
                    onClick={handleSendTransaction}
                    disabled={sending}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-colors mt-4"
                  >
                    {sending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      "Send Transaction"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
