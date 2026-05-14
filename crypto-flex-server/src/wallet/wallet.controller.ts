import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { BalanceService } from 'src/balance/balance.service';
import { TokenService } from 'src/token/token.service';
import { ChainService } from 'src/chain/chain.service';
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly balanceService: BalanceService,
    private readonly tokenService: TokenService,
  ) {}
  @Get(':address/:chain/load')
  @UseGuards(AuthGuard)
  async loadWallet(
    @Param('address') address: string,
    @Param('chain') chainId: string,
  ) {
    const nativeBalance = await this.walletService.getNativeBalance(
      address,
      parseInt(chainId, 16),
    );
    const tokens = await this.walletService.getTokensData(address, chainId);
    return { nativeBalance: nativeBalance, tokens: tokens };
  }
}
