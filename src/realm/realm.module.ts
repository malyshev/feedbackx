import { Module } from '@nestjs/common';
import { CreateRealmService } from './services/create-realm.service';
import { CreateRealmController } from './controllers/create-realm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealmEntity } from './entities/realm.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RealmEntity])],
    providers: [CreateRealmService],
    controllers: [CreateRealmController],
})
export class RealmModule {}
