export class ChainResponseDto {
  id: number;
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl?: string;
  testnet: boolean;
  isActive: boolean;

  constructor(chain: any) {
    this.id = chain.id;
    this.chainId = chain.chainId;
    this.name = chain.name;
    this.symbol = chain.symbol;
    this.rpcUrl = chain.rpcUrl;
    this.explorerUrl = chain.explorerUrl;
    this.testnet = chain.testnet;
    this.isActive = chain.isActive;
  }
}
