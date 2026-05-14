import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { BalanceService } from 'src/balance/balance.service';

@Module({
  controllers: [TokenController],
  providers: [TokenService, BalanceService],
})
export class TokenModule {}
