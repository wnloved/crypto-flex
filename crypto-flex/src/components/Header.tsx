import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlobalSearch from "./Search";
function Header() {
  const [avatar, setAvatar] = useState<string>("./anon.png");

  const loadAvatar = () => {
    const savedAvatar = localStorage.getItem("avatar");
    setAvatar(savedAvatar || "./anon.png");
  };

  useEffect(() => {
    loadAvatar();

    window.addEventListener("localStorageChange", loadAvatar);

    window.addEventListener("storage", (e) => {
      if (e.key === "avatar") {
        setAvatar(e.newValue || "./anon.png");
      }
    });

    return () => {
      window.removeEventListener("localStorageChange", loadAvatar);
      window.removeEventListener("storage", loadAvatar);
    };
  }, []);

  useEffect(() => {
    loadAvatar();
  }, [location.pathname]);
  return (
    <div className="w-full h-1/10 bg-black opacity-0 hover:opacity-100 transition duration-600 fixed flex justify-around items-center z-10">
      <div className="font-bold text-4xl text-white w-1/4">CryptoFlex</div>
      <ul className="flex justify-around w-1/3 items-center text-white text-base h-full font-bold text-xl">
        <Link to="/">Home</Link>
        <Link to="/tokens">Tokens</Link>
        <Link to="/transactoins">Transactions</Link>
        <Link to="/contacts">Contacts</Link>
      </ul>
      <GlobalSearch />
      <Link
        to="/profile"
        className="h-full flex justify-end items-center w-1/16"
      >
        <img className="rounded-full h-2/4" src={avatar} />
      </Link>
    </div>
  );
}

export default Header;
