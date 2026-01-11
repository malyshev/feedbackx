import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateRealmDto, RealmDetailResponseDto } from '../dto';
import { CreateRealmService } from '../services/create-realm.service';

@Controller('realms')
export class CreateRealmController {
    constructor(private readonly createRealmService: CreateRealmService) {}

    @Post()
    public async handle(@Body() dto: CreateRealmDto): Promise<RealmDetailResponseDto> {
        const realm = await this.createRealmService.handle(dto);

        return plainToInstance(RealmDetailResponseDto, realm, {
            excludeExtraneousValues: true,
        });
    }
}
