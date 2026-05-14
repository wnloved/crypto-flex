import Header from "./components/Header";
import Home from "./components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wallet from "./components/Wallet";
import Transactions from "./components/Transactions";
import Contacts from "./components/Contacts";
import Tokens from "./components/Tokens";
import TokenPage from "./components/Token";
function App() {
  return (
    <div className="bg-[#151719] h-screen overflow-auto">
      <BrowserRouter>
        <Header></Header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallet/:idProf" element={<Wallet />} />
          <Route path="/profile" element={<Wallet />} />
          <Route path="/transactoins" element={<Transactions />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/token/:chain/:address" element={<TokenPage />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
