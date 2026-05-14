import { useEffect, useRef } from "react";

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    let activeElements: Array<{
      type: string;
      x: number;
      y: number;
      life: number;
      maxLife: number;
      phase: "appearing" | "stable" | "disappearing";
      params: any;
    }> = [];

    let lastSpawnTime: { [key: string]: number } = {};

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawnElement = () => {
      if (activeElements.length < 6) {
        const margin = 150;
        const x = margin + Math.random() * (canvas.width - margin * 2);
        const y = margin + Math.random() * (canvas.height - margin * 2);

        const typesWithWeights = [
          { type: "blockchain", weight: 2 },
          { type: "candlesticks", weight: 1 },
          { type: "hash", weight: 2 },
          { type: "btc_chart", weight: 2 },
          { type: "network", weight: 2 },
          { type: "smart_contract", weight: 1 },
          { type: "merkle", weight: 1 },
          { type: "proof_of_work", weight: 1 },
          { type: "wallet", weight: 1 },
          { type: "node", weight: 1 },
          { type: "big_candles", weight: 1 },
        ];

        const totalWeight = typesWithWeights.reduce(
          (sum, item) => sum + item.weight,
          0,
        );
        let random = Math.random() * totalWeight;
        let selectedType = "blockchain";

        for (const item of typesWithWeights) {
          if (random < item.weight) {
            selectedType = item.type;
            break;
          }
          random -= item.weight;
        }

        const now = Date.now();
        if (
          lastSpawnTime[selectedType] &&
          now - lastSpawnTime[selectedType] < 10000
        ) {
          return;
        }
        lastSpawnTime[selectedType] = now;

        const scale = 0.7 + Math.random() * 0.8;

        const accentColor = Math.random() > 0.5 ? "255, 80, 80" : "80, 255, 80";

        activeElements.push({
          type: selectedType,
          x,
          y,
          life: 0,
          maxLife: 800 + Math.random() * 500,
          phase: "appearing",
          params: {
            scale: scale,
            rotation: Math.random() * Math.PI * 2,
            speed: 0.1 + Math.random() * 0.3,
            accentColor: accentColor,
          },
        });
      }
    };

    setInterval(() => {
      spawnElement();
    }, 4000);

    const drawBlockchain = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const blockSize = 45 * params.scale;
      const blocks = 5;
      const accentColor = params.accentColor;

      for (let i = 0; i < blocks; i++) {
        const blockX = x + i * blockSize * 1.2 - (blocks * blockSize * 1.2) / 2;
        const blockY = y + Math.sin(time * params.speed + i) * 10;

        if (i % 2 === 0) {
          ctx.strokeStyle = `rgba(${accentColor}, ${life * 0.8})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.8})`;
        }
        ctx.lineWidth = 1.5;
        ctx.strokeRect(blockX, blockY, blockSize, blockSize);

        ctx.font = `${10 * params.scale}px monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.5})`;
        ctx.fillText(
          `${Math.floor(Math.random() * 1000).toString(16)}`,
          blockX + 6,
          blockY + blockSize / 2 + 3,
        );
      }
    };

    const drawCandlesticks = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const candleWidth = 10 * params.scale;
      const spacing = 15 * params.scale;
      const count = 8;

      for (let i = 0; i < count; i++) {
        const candleX = x + i * spacing - (count * spacing) / 2;
        const high = 45 * params.scale * (0.8 + Math.sin(time + i) * 0.2);
        const low = 14 * params.scale * (0.8 + Math.cos(time * 1.3 + i) * 0.2);
        const open = 32 * params.scale * (0.8 + Math.sin(time * 1.1 + i) * 0.2);
        const close =
          38 * params.scale * (0.8 + Math.cos(time * 1.2 + i) * 0.2);

        const isUp = close > open;

        ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(candleX, y - high);
        ctx.lineTo(candleX, y - low);
        ctx.stroke();

        if (isUp) {
          ctx.fillStyle = `rgba(80, 255, 80, ${life * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255, 80, 80, ${life * 0.8})`;
        }

        ctx.fillRect(
          candleX - candleWidth / 2,
          y - Math.max(open, close),
          candleWidth,
          Math.abs(close - open),
        );
      }
    };

    const drawBigCandles = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const candleWidth = 18 * params.scale;
      const spacing = 28 * params.scale;
      const count = 5;

      for (let i = 0; i < count; i++) {
        const candleX = x + i * spacing - (count * spacing) / 2;
        const high = 70 * params.scale * (0.8 + Math.sin(time + i) * 0.2);
        const low = 25 * params.scale * (0.8 + Math.cos(time * 1.3 + i) * 0.2);
        const open = 50 * params.scale * (0.8 + Math.sin(time * 1.1 + i) * 0.2);
        const close =
          58 * params.scale * (0.8 + Math.cos(time * 1.2 + i) * 0.2);

        const isUp = close > open;

        ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(candleX, y - high);
        ctx.lineTo(candleX, y - low);
        ctx.stroke();

        if (isUp) {
          ctx.fillStyle = `rgba(80, 255, 80, ${life * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255, 80, 80, ${life * 0.8})`;
        }

        ctx.fillRect(
          candleX - candleWidth / 2,
          y - Math.max(open, close),
          candleWidth,
          Math.abs(close - open),
        );
      }
    };

    const drawHash = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const radius = 60 * params.scale;
      const hash = "8b1f9d8b3c5a7e2f4d6c";
      const count = 6;
      const accentColor = params.accentColor;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time * params.speed;
        const r = radius + Math.sin(time * 2 + i) * 10;

        const hashX = x + Math.cos(angle) * r;
        const hashY = y + Math.sin(angle) * r;

        if (i % 2 === 0) {
          ctx.fillStyle = `rgba(${accentColor}, ${life * 0.6})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.5})`;
        }

        ctx.font = `${12 * params.scale}px monospace`;
        ctx.fillText(hash.substr(i * 3, 3), hashX - 15, hashY);
      }
    };

    const drawBTCChart = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      ctx.beginPath();
      const accentColor = params.accentColor;

      ctx.strokeStyle = `rgba(${accentColor}, ${life * 0.8})`;
      ctx.lineWidth = 2;

      const width = 160 * params.scale;

      for (let i = 0; i < 50; i++) {
        const chartX = x - width / 2 + i * (width / 50);
        const t = i / 50;
        const chartY =
          y - 35 * Math.sin(t * 8 + time) - 20 * Math.cos(t * 4 + time * 2);

        if (i === 0) ctx.moveTo(chartX, chartY);
        else ctx.lineTo(chartX, chartY);
      }
      ctx.stroke();

      ctx.font = `${16 * params.scale}px monospace`;
      ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.7})`;
      ctx.fillText("₿", x + width / 2 + 10, y - 20);
    };

    const drawNetwork = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const nodes = 5;
      const radius = 60 * params.scale;
      const accentColor = params.accentColor;

      for (let i = 0; i < nodes; i++) {
        const angle = (i / nodes) * Math.PI * 2 + time * 0.2;
        const nodeX = x + Math.cos(angle) * radius;
        const nodeY = y + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.fillStyle = `rgba(${accentColor}, ${life * 0.2})`;
          ctx.strokeStyle = `rgba(${accentColor}, ${life * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.1})`;
          ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.6})`;
        }

        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 8 * params.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    };

    const drawSmartContract = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const accentColor = params.accentColor;

      ctx.font = `${11 * params.scale}px monospace`;
      ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.5})`;
      ctx.fillText("{ contract }", x - 30, y - 5);

      ctx.fillStyle = `rgba(${accentColor}, ${life * 0.7})`;
      ctx.fillText("transfer()", x - 25, y + 10);
    };

    const drawMerkle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const accentColor = params.accentColor;

      ctx.strokeStyle = `rgba(${accentColor}, ${life * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 10 * params.scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.5})`;
      for (let i = -1; i <= 1; i += 2) {
        const childX = x + i * 30 * params.scale;
        ctx.beginPath();
        ctx.arc(
          childX,
          y + 25 * params.scale,
          7 * params.scale,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    };

    const drawProofOfWork = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const accentColor = params.accentColor;

      for (let i = 0; i < 3; i++) {
        const nonceX = x - 30 + i * 18;
        const nonceY = y + Math.sin(time * 6 + i) * 5;

        if (i === 0) {
          ctx.strokeStyle = `rgba(${accentColor}, ${life * 0.6})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.4})`;
        }
        ctx.lineWidth = 1.2;
        ctx.strokeRect(nonceX, nonceY, 10, 10);
      }

      ctx.font = `${9 * params.scale}px monospace`;
      ctx.fillStyle = `rgba(${accentColor}, ${life * 0.7})`;
      ctx.fillText("000", x + 20, y);
    };

    const drawWallet = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const accentColor = params.accentColor;

      ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 25, y - 12, 50, 24);

      ctx.font = `${12 * params.scale}px monospace`;
      ctx.fillStyle = `rgba(${accentColor}, ${life * 0.8})`;
      ctx.fillText("₿", x - 4, y + 4);
    };

    const drawNode = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      life: number,
      params: any,
    ) => {
      const accentColor = params.accentColor;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${accentColor}, ${life * 0.15})`;
      ctx.arc(x, y, 15 * params.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = `${9 * params.scale}px monospace`;
      ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.5})`;
      ctx.fillText("node", x - 12, y - 15);
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = "#151719";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      activeElements = activeElements.filter((el) => {
        if (el.phase === "appearing") {
          el.life += 0.003;
          if (el.life >= 1.0) {
            el.life = 1.0;
            el.phase = "stable";
          }
        } else if (el.phase === "stable") {
          el.maxLife -= 1;
          if (el.maxLife <= 0) {
            el.phase = "disappearing";
          }
        } else if (el.phase === "disappearing") {
          el.life -= 0.003;
        }

        return el.life > 0;
      });

      activeElements.forEach((el) => {
        const maxSize = 200 * el.params.scale;
        if (
          el.x - maxSize / 2 < 0 ||
          el.x + maxSize / 2 > canvas.width ||
          el.y - maxSize / 2 < 0 ||
          el.y + maxSize / 2 > canvas.height
        ) {
          return;
        }

        switch (el.type) {
          case "blockchain":
            drawBlockchain(ctx, el.x, el.y, el.life, el.params);
            break;
          case "candlesticks":
            drawCandlesticks(ctx, el.x, el.y, el.life, el.params);
            break;
          case "big_candles":
            drawBigCandles(ctx, el.x, el.y, el.life, el.params);
            break;
          case "hash":
            drawHash(ctx, el.x, el.y, el.life, el.params);
            break;
          case "btc_chart":
            drawBTCChart(ctx, el.x, el.y, el.life, el.params);
            break;
          case "network":
            drawNetwork(ctx, el.x, el.y, el.life, el.params);
            break;
          case "smart_contract":
            drawSmartContract(ctx, el.x, el.y, el.life, el.params);
            break;
          case "merkle":
            drawMerkle(ctx, el.x, el.y, el.life, el.params);
            break;
          case "proof_of_work":
            drawProofOfWork(ctx, el.x, el.y, el.life, el.params);
            break;
          case "wallet":
            drawWallet(ctx, el.x, el.y, el.life, el.params);
            break;
          case "node":
            drawNode(ctx, el.x, el.y, el.life, el.params);
            break;
        }
      });

      time += 0.02;
      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 2; i++) {
      setTimeout(() => spawnElement(), i * 1000);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  return (
    <>
      <div className="h-screen w-full flex justify-center items-center">
        <div className="h-5/6 w-5/6 flex justify-center items-center font-bold text-white text-9xl z-4">
          Welcome to CryptoFlex
        </div>
        <canvas
          ref={canvasRef}
          id="background"
          className="absolute h-full w-full z-3 opacity-70"
        ></canvas>
      </div>
      <div className="h-fit w-full text-white flex items-start">
        <div className="h-fit w-full text-white flex items-start">
          <div className="h-fit w-5/6 flex justify-center flex-col items-center text-white z-4 mx-auto">
            <h1 className="text-7xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent leading-relaxed">
              Crypto Wallet — Your Comfortable Use
            </h1>

            <h2 className="text-3xl font-semibold mb-6 text-center max-w-4xl">
              Crypto Wallet — Your Reliable and Convenient Companion in the
              World of Digital Assets
            </h2>

            <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl">
              Crypto Wallet is more than just a tool for storing cryptocurrency.
              It's your personal interface to the blockchain — built with
              simplicity, security, and freedom in mind.
            </p>

            <p className="text-lg text-gray-400 mb-12 text-center max-w-2xl">
              We combine the power of decentralized technology with the ease of
              a modern web interface, so you can manage your assets as easily as
              a banking app — but without intermediaries.
            </p>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="text-xl font-semibold mb-2">
                  Manage Assets in One Click
                </h3>
                <p className="text-gray-400 text-sm">
                  Send and receive ETH and ERC-20 tokens. Instantly access your
                  balance and transaction history. Multi‑network support:
                  Ethereum, Sepolia, and more.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-xl font-semibold mb-2">
                  Full Control Without Compromise
                </h3>
                <p className="text-gray-400 text-sm">
                  Your keys — only yours. No registrations, logins, or
                  passwords. Transparency and security at the smart contract
                  level.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all">
                <div className="text-3xl mb-3">⚡️</div>
                <h3 className="text-xl font-semibold mb-2">
                  DeFi & Token Integration
                </h3>
                <p className="text-gray-400 text-sm">
                  Manage your tokens directly from the interface. Support for
                  any ERC‑20 token — just add the address. Ready for integration
                  with exchanges and staking.
                </p>
              </div>
            </div>

            {}
            <div className="w-full max-w-5xl mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-center">
                Who It's For:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm border border-white/5">
                  👶 Crypto Beginners — clean interface, no complex jargon
                </span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm border border-white/5">
                  🚀 Advanced Users — quick access to asset management
                </span>
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm border border-white/5">
                  💻 Developers — open‑source and fully customizable
                </span>
              </div>
            </div>

            {}
            <div className="w-full max-w-5xl mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-center">
                Why Choose Crypto Wallet:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5">
                  ✅ Minimalist design
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5">
                  ⚡ MetaMask connection
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5">
                  🌐 Works in any browser
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5">
                  💸 Free and unlimited
                </div>
                <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/5 col-span-2 md:col-span-4">
                  ✨ Crafted with attention to detail and user experience
                </div>
              </div>
            </div>

            {}
            <div className="text-center max-w-2xl">
              <p className="text-gray-400 text-lg">
                Crypto Wallet is your key to the decentralized world.
                <span className="text-green-400 font-semibold"> Simple.</span>
                <span className="text-red-400 font-semibold"> Safe.</span>
                <span className="text-white font-semibold"> Yours.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
