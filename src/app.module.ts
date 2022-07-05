import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DeckModule } from './deck/deck.module';
import { CardModule } from './card/card.module';
import { CollectionModule } from './collection/collection.module';
import { PackModule } from './pack/pack.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    DeckModule,
    CardModule,
    CollectionModule,
    PackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
