import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('/save')
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }
  @Get('/:address')
  getAll(@Param('address') address: string) {
    return this.transactionsService.getAll(address);
  }
  @Get('from/:address/:chain')
  getAllFromApi(
    @Param('address') address: string,
    @Param('chain') chain: string,
  ) {
    return this.transactionsService.getFromApi(address, parseInt(chain, 16));
  }
}
