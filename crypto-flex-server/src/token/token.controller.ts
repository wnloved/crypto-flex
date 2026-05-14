import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() CreateTokenDto: CreateTokenDto) {
    console.log(CreateTokenDto);
    return this.tokenService.create(CreateTokenDto);
  }
  @Post('/track/:address/:chain/:token')
  @UseGuards(AuthGuard)
  track(
    @Param('address') address: string,
    @Param('chain') chain,
    @Param('token') token: string,
  ) {
    return this.tokenService.addToTracked(address, token, parseInt(chain, 16));
  }
  @Get('tracked/:address/:chain')
  @UseGuards(AuthGuard)
  getAllTracked(@Param('address') address: string, @Param('chain') chain) {
    return this.tokenService.getAllTracked(address, parseInt(chain, 16));
  }

  @Get('/all')
  getAll() {
    return this.tokenService.getAll();
  }
  @Get('/:chain/:address')
  getOne(@Param('chain') chain: string, @Param('address') address: string) {
    return this.tokenService.getOne(address, parseInt(chain, 16));
  }
}
