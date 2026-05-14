import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { TokenService } from 'src/token/token.service';
import { WalletService } from 'src/wallet/wallet.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}
  @Get('/:address')
  checkBalance(@Param('address') address: string) {
    this.balanceService.getTokenBalance(address);
  }
  @Get('from/:address')
  getBalance(@Param('address') address: string) {
    this.balanceService.getBalanceFromApi(1, address);
  }
}
