import { IntersectionType, ApiExtraModels } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RealmResponseDto } from './realm-response.dto';
import { BaseRealmDto } from './base-realm.dto';
import { RealmGeneratedFieldsDto } from './realm-generated-fields.dto';

/**
 * Realm API Key DTO
 * Contains the API key field for admin endpoints
 */
class RealmApiKeyDto {
    @ApiProperty({
        example: 'fx_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
        description:
            'Realm API key - authentication credential for client applications. SECURITY: Only exposed in admin endpoints - never in public API responses. Clients use this key to authenticate requests to POST /realms/:key/feedbacks. Should be treated as a secret - never commit to version control or log.',
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    public apiKey!: string;
}

/**
 * Realm Detail Response DTO (Admin only)
 * Includes sensitive apiKey - only for admin endpoints
 * Used in admin endpoints where API key needs to be returned (e.g., POST /admin/realms)
 * Uses IntersectionType to combine RealmResponseDto with apiKey field
 */
@ApiExtraModels(RealmResponseDto, RealmApiKeyDto, BaseRealmDto, RealmGeneratedFieldsDto)
export class RealmDetailResponseDto extends IntersectionType(RealmResponseDto, RealmApiKeyDto) {}
