import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChainService } from './chain.service';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';

@Controller('chain')
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Post('/create')
  create(@Body() createChainDto: CreateChainDto) {
    return this.chainService.upsert(createChainDto);
  }
  @Get('/getAll')
  getAll() {
    return this.chainService.getAll();
  }
}
