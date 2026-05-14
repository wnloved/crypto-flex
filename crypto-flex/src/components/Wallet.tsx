import { useEffect, useState, useRef } from "react";
import { useSyncProviders } from "../hooks/useSyncProviders";
import { FileUploader } from "./FileUplaoder";
import { useParams, useNavigate } from "react-router-dom";

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string | null;
  price: number;
  balance: string;
  chainId: number;
}

interface WalletResponse {
  nativeBalance: string;
  tokens: Token[];
}

interface UserInfo {
  id: number;
  username: string;
  balance: string;
  bio: string;
  avatar: string;
}

interface LinkedWallet {
  id: number;
  wltAdress: string;
  name: string;
}

const DEFAULT_AVATAR = "http://localhost:5173/anon.png";

function Wallet() {
  const navigate = useNavigate();
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState<string>("");
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [chain, setChain] = useState("0x1");
  const [chains, setChains] = useState([]);
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([]);
  const providers = useSyncProviders();
  const nickname = useRef<HTMLInputElement>(null);
  const bio = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState("viewer");
  const defaultDto: UserInfo = {
    id: 0,
    username: "CryptoUser",
    balance: "---",
    bio: "",
    avatar: DEFAULT_AVATAR,
  };
  const [UserDto, setUserDto] = useState<UserInfo>(defaultDto);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { idProf } = useParams();
  const myIdProf = parseJwt(localStorage.getItem("Token") || "")?.sub;
  const isMyProfile = !idProf || Number(idProf) === myIdProf;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  function parseJwt(token: string) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    setUserDto(defaultDto);
    setWalletData(null);
    setLinkedWallets([]);
    setUserAccount("");
    setSelectedWallet(undefined);
    setOpen(false);
    setChain("0x1");

    const savedToken = localStorage.getItem("Token");
    const savedAddress = localStorage.getItem("userAddress");

    if (savedToken) {
      setToken(savedToken);
    }

    if (isMyProfile) {
      const walletName = localStorage.getItem("walletName");
      if (walletName && providers.length > 0) {
        const saved = providers.find((p) => p.info.name === walletName);
        if (saved) setSelectedWallet(saved);
      }
      if (savedAddress) setUserAccount(savedAddress);
    }
  }, [idProf]);

  useEffect(() => {
    const savedToken = localStorage.getItem("Token");
    const savedAddress = localStorage.getItem("userAddress");
    if (savedToken && savedAddress) {
      if (providers.length > 0) {
        const savedProvider = providers.find(
          (p) => p.info.name === localStorage.getItem("walletName"),
        );
        setSelectedWallet(savedProvider || providers[0]);
      }
      setUserAccount(savedAddress);
      setToken(savedToken);
    }
  }, [providers]);

  useEffect(() => {
    if (token) {
      getUserInfo();
    }
  }, [token, idProf]);

  useEffect(() => {
    if (!userAccount || !token) return;
    fetchBalances();
  }, [userAccount, token, chain]);

  const handleChainChange = (chainSelect: number) => {
    setChain("0x" + chainSelect.toString(16));
  };

  const handleFileSelect = (file: File) => {
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const fetchBalances = async () => {
    setLoadingBalances(true);
    try {
      const response = await fetch(
        `http://localhost:3000/wallet/${userAccount}/${chain}/load`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch balances");

      const data: WalletResponse = await response.json();
      setWalletData(data);

      const chainData = await fetch("http://localhost:3000/chain/getAll", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const chainJSON = await chainData.json();
      setChains(chainJSON);
      setUserDto((prev) => ({
        ...prev,
        balance: data.nativeBalance,
      }));
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const switchWallet = (address: string) => {
    setUserAccount(address);
    if (isMyProfile) {
      localStorage.setItem("userAddress", address);
    }
  };

  async function getUserInfo() {
    if (!token) return;

    const userId = isMyProfile ? myIdProf : idProf;
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:3000/user/info/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (!isMyProfile) {
          alert("User not found");
          navigate("/profile");
        }
        return;
      }

      const json = await res.json();

      const avatarUrl = json.avatar
        ? json.avatar.startsWith("http")
          ? json.avatar
          : `http://localhost:3000${json.avatar}`
        : DEFAULT_AVATAR;

      setUserDto({
        id: json.id || 0,
        username: json.username || "CryptoUser",
        balance: json.balance || "0",
        bio: json.bio || "",
        avatar: avatarUrl,
      });

      if (isMyProfile) {
        localStorage.setItem("avatar", json.avatar || "");
        window.dispatchEvent(new Event("localStorageChange"));
      }

      await fetchUserWallets(Number(userId));
    } catch (error) {
      console.error("Failed to get user info:", error);
      if (!isMyProfile) {
        alert("Error loading user");
        navigate("/profile");
      }
    }
  }

  async function fetchUserWallets(userId: number) {
    try {
      const res = await fetch(`http://localhost:3000/user/wallets/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const wallets = await res.json();
        setLinkedWallets(wallets);

        if (wallets.length > 0) {
          if (isMyProfile) {
            const savedAddress = localStorage.getItem("userAddress");
            if (
              savedAddress &&
              wallets.some(
                (w: LinkedWallet) =>
                  w.wltAdress.toLowerCase() === savedAddress.toLowerCase(),
              )
            ) {
              setUserAccount(savedAddress);
            } else {
              setUserAccount(wallets[0].wltAdress);
            }
          } else {
            setUserAccount(wallets[0].wltAdress);
            setSelectedWallet(undefined);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    }
  }

  const handleConnect = async (linkToExisting: boolean = false) => {
    if (providers.length === 0) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const provider = providers[0];
      const accounts = (await provider.provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts?.[0]) return;

      const address = accounts[0];

      if (linkToExisting && token) {
        const data = await getNonce(address, UserDto.id);
        const message = data.message;

        const signature = (await provider.provider.request({
          method: "personal_sign",
          params: [message, address],
        })) as string;

        await VerifySign(address, signature);
        await fetchUserWallets(myIdProf);
        setIsConnecting(false);
        return;
      }

      const data = await getNonce(address);
      const message = data.message;

      const signature = (await provider.provider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      const Token = await VerifySign(address, signature);

      localStorage.setItem("Token", Token.AccessToken);
      localStorage.setItem("userAddress", address);
      localStorage.setItem("walletName", provider.info.name);

      setSelectedWallet(provider);
      setUserAccount(address);
      setToken(Token.AccessToken);
      await getUserInfo();
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("walletName");
    localStorage.removeItem("avatar");
    setSelectedWallet(undefined);
    setUserAccount("");
    setToken("");
    setUserDto(defaultDto);
    setWalletData(null);
    setLinkedWallets([]);
    window.dispatchEvent(new Event("localStorageChange"));
  };

  async function getNonce(address: string, userId?: number) {
    const res = await fetch("http://localhost:3000/auth/nonce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, userId }),
    });
    return res.json();
  }

  async function VerifySign(address: string, sign: string) {
    const res = await fetch("http://localhost:3000/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature: sign }),
    });
    return res.json();
  }

  async function UpdateUser() {
    setMode("viewer");
    const formData = new FormData();
    formData.append("username", nickname.current?.value || "");
    formData.append("bio", bio.current?.value || "");

    if (avatarFile) {
      formData.append("file", avatarFile);
    }
    try {
      const res = await fetch("http://localhost:3000/user/update", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      setUserDto({
        ...UserDto,
        bio: json.bio,
        username: json.username,
        avatar: json.avatar,
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const currentWalletName =
    linkedWallets.find(
      (w) => w.wltAdress.toLowerCase() === userAccount?.toLowerCase(),
    )?.name || formatAddress(userAccount);

  const handleAddToContacts = async () => {
    if (!contactName.trim()) {
      alert("Enter contact name");
      return;
    }

    setAddingContact(true);
    try {
      const res = await fetch(`http://localhost:3000/contacts/add/${idProf}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactId: Number(idProf),
          nickname: contactName.trim(),
          description: contactNote.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to add contact");

      setIsContactModalOpen(false);
      setContactName("");
      setContactNote("");
      alert("Contact added!");
    } catch (error) {
      console.error("Failed to add contact:", error);
      alert("Failed to add contact");
    } finally {
      setAddingContact(false);
    }
  };

  return (
    <div className="h-fit w-full flex justify-center items-center bg-[#151719] flex-col text-white">
      <div className="mt-30 h-1/2 w-5/6 border border-white rounded flex flex-col justify-around mb-10">
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center">
            <h1 className="text-white font-bold text-5xl mr-2">Profile</h1>
            {isMyProfile && userAccount != "" && (
              <img
                onClick={() =>
                  mode != "edit" ? setMode("edit") : UpdateUser()
                }
                className="h-[30px] opacity-0 hover:opacity-100 transition-opacity duration-250 cursor-pointer"
                src={
                  mode != "edit" ? "./edit pencil dis.png" : "./edit pencil.png"
                }
              />
            )}
          </div>

          <div className="flex gap-2">
            {isMyProfile ? (
              <>
                {userAccount && (
                  <button
                    onClick={() => handleConnect(true)}
                    disabled={isConnecting}
                    className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-xl transition-colors border border-green-600/30 text-sm"
                  >
                    {isConnecting ? (
                      <div className="w-4 h-4 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>
                    ) : (
                      <span>+</span>
                    )}
                    Add Wallet
                  </button>
                )}

                {!selectedWallet ? (
                  <button
                    onClick={() => handleConnect(false)}
                    disabled={isConnecting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl transition-colors"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : providers.length === 0 ? (
                      <>
                        <span className="text-2xl">🦊</span>
                        <span>Install MetaMask</span>
                      </>
                    ) : (
                      <>
                        <span>🔌</span>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-xl transition-colors border border-red-600/30"
                  >
                    <span>🔌</span>
                    <span>Disconnect</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-3 rounded-xl transition-colors border border-green-600/30 text-sm"
                >
                  <span>+</span>
                  Add to Contacts
                </button>
              </>
            )}
          </div>
        </div>

        <div className="h-3/4 flex p-8 pt-0 relative">
          {isMyProfile && mode === "edit" ? (
            <FileUploader
              onFileSelect={handleFileSelect}
              currentImage={avatarPreview || UserDto?.avatar || DEFAULT_AVATAR}
            />
          ) : (
            <img
              className="h-[200px] aspect-square object-cover rounded-full border-2 border-white/20 "
              src={
                isMyProfile && avatarPreview
                  ? avatarPreview
                  : UserDto?.avatar || DEFAULT_AVATAR
              }
              alt="avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
          )}

          <div className="flex flex-col p-4 justify-center">
            {isMyProfile ? (
              <input
                maxLength={15}
                ref={nickname}
                placeholder={mode != "edit" ? "" : "Username"}
                type="text"
                value={UserDto.username}
                onChange={(e) =>
                  setUserDto({ ...UserDto, username: e.target.value })
                }
                readOnly={mode != "edit"}
                className="font-bold text-3xl outline-none bg-transparent"
              />
            ) : (
              <h2 className="font-bold text-3xl">{UserDto.username}</h2>
            )}

            {userAccount ? (
              <>
                {linkedWallets.length > 0 && (
                  <div className="mt-2 relative max-w-[280px]">
                    <button
                      onClick={() => setOpen(!open)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${isMyProfile ? "bg-blue-500" : "bg-gray-400"}`}
                      />
                      <span className="font-medium truncate flex-1 text-left">
                        {currentWalletName}
                      </span>
                      <span className="text-gray-500 font-mono text-xs flex-shrink-0">
                        {formatAddress(userAccount)}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
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

                    {open && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1c1f] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                        {linkedWallets.map((w) => (
                          <button
                            key={w.id}
                            onClick={() => {
                              switchWallet(w.wltAdress);
                              setOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors
                              ${userAccount?.toLowerCase() === w.wltAdress.toLowerCase() ? "bg-blue-600/20" : "hover:bg-white/5"}
                            `}
                          >
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${userAccount?.toLowerCase() === w.wltAdress.toLowerCase() ? (isMyProfile ? "bg-blue-500" : "bg-gray-400") : "bg-gray-600"}`}
                            />
                            <span className="font-medium truncate flex-1">
                              {w.name || "Wallet"}
                            </span>
                            <span className="text-gray-500 font-mono text-xs flex-shrink-0">
                              {formatAddress(w.wltAdress)}
                            </span>
                            {userAccount?.toLowerCase() ===
                              w.wltAdress.toLowerCase() && (
                              <svg
                                className={`w-4 h-4 flex-shrink-0 ${isMyProfile ? "text-blue-400" : "text-gray-400"}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <span className="text-sm mt-2">
                  Balance:{" "}
                  {loadingBalances
                    ? "Loading..."
                    : `${walletData?.nativeBalance || "0"} ETH`}
                </span>
                <textarea
                  maxLength={70}
                  placeholder={mode != "edit" ? "" : "About:"}
                  onChange={(e) =>
                    setUserDto({ ...UserDto, bio: e.target.value })
                  }
                  value={UserDto.bio}
                  ref={bio}
                  readOnly={mode != "edit"}
                  className="text-sm outline-none overflow-hidden resize-none bg-transparent"
                />
              </>
            ) : (
              <>
                <span className="text-gray-400">Wallet not connected</span>
                <span className="text-gray-400">Key: Not available</span>
                <span className="text-sm">Balance: ---</span>
                <textarea className="text-sm bg-transparent" readOnly>
                  No bio
                </textarea>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-fit mb-10 w-5/6 border border-white rounded flex flex-col justify-around">
        <h1 className="font-bold text-5xl p-8 pb-4">Tokens</h1>
        <div className="text-xl pl-8 w-1/4 pb-4">
          Choose network:
          <Select onChainSelect={handleChainChange} chains={chains} />
        </div>
        <CoinTable
          userAccount={userAccount}
          walletData={walletData}
          loading={loadingBalances}
        />
      </div>
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1c1f] rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add to Contacts</h2>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  setContactName("");
                  setContactNote("");
                }}
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
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
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
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder="ETH God"
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsContactModalOpen(false);
                    setContactName("");
                    setContactNote("");
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToContacts}
                  disabled={addingContact || !contactName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {addingContact ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Contact"
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

function CoinTable({
  userAccount,
  walletData,
  loading,
}: {
  userAccount: string;
  walletData: WalletResponse | null;
  loading: boolean;
}) {
  const navigate = useNavigate();
  if (!userAccount) {
    return (
      <div className="w-full p-12 text-center text-gray-400">
        <p className="text-xl mb-2">🔒 Connect wallet to view your tokens</p>
        <p className="text-sm">Your assets will appear here after connection</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-12 text-center text-gray-400">
        <div className="flex justify-center items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          <p className="text-xl">Loading your balances...</p>
        </div>
      </div>
    );
  }

  if (!walletData || walletData.tokens.length === 0) {
    return (
      <div className="w-full p-12 text-center text-gray-400">
        <p className="text-xl mb-2">💼 No tokens found</p>
        <p className="text-sm">Add tokens to see them here</p>
      </div>
    );
  }

  return (
    <table className="w-15/16 h-fit m-auto pb-8">
      <thead>
        <tr className="border-b border-white/10 text-sm">
          <th className="w-1/16 text-center py-3">Image</th>
          <th className="w-1/8 text-left">Name</th>
          <th className="w-3/8"></th>
          <th className="w-1/16 text-center">Price (USDT)</th>
          <th className="w-1/16 text-center">Quantity</th>
          <th className="w-1/16 text-center">Balance</th>
        </tr>
      </thead>
      <tbody>
        {walletData.tokens.map((item, index) => (
          <tr
            key={index}
            onClick={() => {
              navigate(`/token/0x${item.chainId.toString(16)}/${item.address}`);
            }}
            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <td className="py-4">
              <img
                src={item.logo || "./ava.jpg"}
                className="h-[40px] w-[40px] rounded-full m-auto"
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "./ava.jpg";
                }}
              />
            </td>
            <td className="text-left">
              <div>{item.name}</div>
              <div className="text-xs text-gray-400">{item.symbol}</div>
            </td>
            <td></td>
            <td className="text-center">{item.price}</td>
            <td className="text-center">
              {parseFloat(item.balance).toFixed(4)}
            </td>
            <td className="text-center text-green-400">
              {(parseFloat(item.balance) * (item.price || 0)).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface Chain {
  id: number;
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl?: string;
  testnet: boolean;
  isActive: boolean;
}

interface SelectProps {
  chains: Chain[];
  onChainSelect: (chain: number) => void;
}

function Select({ onChainSelect, chains }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Ethereum");

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white bg-transparent px-2 py-1 text-xs flex items-center gap-1 hover:bg-white/5 rounded-lg transition-colors"
      >
        {selected}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#151719] rounded-lg shadow-xl z-50 min-w-[100px] border border-white/10 text-sm">
          {chains.map((chain) => (
            <div
              key={chain.id}
              onClick={() => {
                setSelected(chain.name);
                setIsOpen(false);
                onChainSelect(chain.chainId);
              }}
              className="px-3 py-1.5 hover:bg-white/10 cursor-pointer whitespace-nowrap text-white first:rounded-t-lg last:rounded-b-lg"
            >
              {chain.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wallet;
