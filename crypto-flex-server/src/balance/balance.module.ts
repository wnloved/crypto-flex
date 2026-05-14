import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';

@Module({
  controllers: [BalanceController],
  providers: [BalanceService, TokenService, WalletService],
})
export class BalanceModule {}
