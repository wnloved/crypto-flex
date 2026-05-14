import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokenModule } from './token/token.module';
import { BalanceModule } from './balance/balance.module';
import { ChainModule } from './chain/chain.module';
import { WalletService } from './wallet/wallet.service';
import { BalanceService } from './balance/balance.service';
import { TokenService } from './token/token.service';
import { ChainService } from './chain/chain.service';
import { S3Service } from './s3/s3.service';
import { TransactionsModule } from './transactions/transactions.module';
import { RedisModule } from './redis/redis.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    WalletModule,
    AuthModule,
    PrismaModule,
    TokenModule,
    BalanceModule,
    ChainModule,
    TransactionsModule,
    RedisModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WalletService,
    BalanceService,
    TokenService,
    ChainService,
  ],
})
export class AppModule {}
