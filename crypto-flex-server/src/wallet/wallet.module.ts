import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { BalanceService } from 'src/balance/balance.service';
import { TokenService } from 'src/token/token.service';
import { ChainService } from 'src/chain/chain.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, BalanceService, TokenService, ChainService],
})
export class WalletModule {}
