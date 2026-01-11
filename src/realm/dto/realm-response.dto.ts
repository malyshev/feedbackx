import { IntersectionType } from '@nestjs/swagger';
import { ApiExtraModels } from '@nestjs/swagger';
import { BaseRealmDto } from './base-realm.dto';
import { RealmGeneratedFieldsDto } from './realm-generated-fields.dto';

/**
 * Realm Response DTO
 * Public response for realm data - combines BaseRealmDto with auto-generated fields
 * Omits sensitive apiKey - used in GET /realms endpoints for non-admin users
 * Uses IntersectionType to combine BaseRealmDto fields with auto-generated fields
 */
@ApiExtraModels(BaseRealmDto, RealmGeneratedFieldsDto)
export class RealmResponseDto extends IntersectionType(BaseRealmDto, RealmGeneratedFieldsDto) {}
