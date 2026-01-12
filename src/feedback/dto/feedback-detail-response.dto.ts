import { IntersectionType, ApiExtraModels } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FeedbackResponseDto } from './feedback-response.dto';
import { BaseFeedbackDto } from './base-feedback.dto';
import { FeedbackGeneratedFieldsDto } from './feedback-generated-fields.dto';

import { ApiInternal } from '../../common/decorators';

/**
 * Feedback API Key DTO
 * Contains the API key field for admin endpoints
 */
@ApiInternal()
export class FeedbackApiKeyDto {
    @ApiProperty({
        example: 'fx_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
        description:
            'Feedback collection API key - authentication credential for client applications. SECURITY: Only exposed in admin endpoints - never in public API responses. Clients use this key to authenticate requests to POST /feedbacks/:key/items. Should be treated as a secret - never commit to version control or log.',
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    public apiKey!: string;
}

/**
 * Feedback Detail Response DTO (Admin only)
 * Includes sensitive apiKey - only for admin endpoints
 * Used in admin endpoints where API key needs to be returned (e.g., POST /admin/feedbacks)
 * Uses IntersectionType to combine FeedbackResponseDto with apiKey field
 */
@ApiExtraModels(FeedbackResponseDto, FeedbackApiKeyDto, BaseFeedbackDto, FeedbackGeneratedFieldsDto)
export class FeedbackDetailResponseDto extends IntersectionType(FeedbackResponseDto, FeedbackApiKeyDto) {}
