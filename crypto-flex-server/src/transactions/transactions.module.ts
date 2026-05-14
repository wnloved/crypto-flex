import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TokenService } from 'src/token/token.service';
import { BalanceService } from 'src/balance/balance.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TokenService, BalanceService],
})
export class TransactionsModule {}
