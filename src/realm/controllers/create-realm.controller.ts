import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateRealmDto, RealmDetailResponseDto } from '../dto';
import { CreateRealmService } from '../services/create-realm.service';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Realm')
@ApiConsumes('application/json')
@Controller('realms')
export class CreateRealmController {
    constructor(private readonly createRealmService: CreateRealmService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new realm.',
        description: 'Creates a new feedback collection realm with a unique key and generated API key.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: RealmDetailResponseDto,
        description: 'The request has been fulfilled and resulted in a new resource being created.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            'Occurs when the request body contains invalid data, missing required fields, or the realm name/key already exists.',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred while creating the realm.',
    })
    public async handle(@Body() dto: CreateRealmDto): Promise<RealmDetailResponseDto> {
        const realm = await this.createRealmService.handle(dto);

        return plainToInstance(RealmDetailResponseDto, realm, {
            excludeExtraneousValues: true,
        });
    }
}
