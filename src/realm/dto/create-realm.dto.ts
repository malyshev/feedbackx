import { BaseRealmDto } from './base-realm.dto';

/**
 * Create Realm DTO
 * Used for creating a new realm - inherits all fields from BaseRealmDto
 * Omits auto-generated fields (id, timestamps, apiKey)
 */
export class CreateRealmDto extends BaseRealmDto {}
