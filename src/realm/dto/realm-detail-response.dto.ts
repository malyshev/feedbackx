import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { RealmResponseDto } from './realm-response.dto';

/**
 * Realm Detail Response DTO (Admin only)
 * Includes sensitive apiKey - only for admin endpoints
 * Used in admin endpoints where API key needs to be returned (e.g., POST /admin/realms)
 * Extends RealmResponseDto and adds the apiKey field
 */
export class RealmDetailResponseDto extends RealmResponseDto {
    /**
     * Realm API key - authentication credential for client applications
     * SECURITY: Only exposed in admin endpoints - never in public API responses
     * Clients use this key to authenticate requests to POST /realms/:key/feedbacks
     * Should be treated as a secret - never commit to version control or log
     */
    @Expose()
    @IsString()
    @IsNotEmpty()
    public apiKey!: string;
}
