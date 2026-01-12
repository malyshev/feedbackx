import { IntersectionType } from '@nestjs/swagger';
import { ApiExtraModels } from '@nestjs/swagger';
import { ApiInternal } from '../../common/decorators';
import { BaseFeedbackDto } from './base-feedback.dto';
import { FeedbackGeneratedFieldsDto } from './feedback-generated-fields.dto';

/**
 * Feedback Response DTO
 * Public response for feedback collection data - combines BaseFeedbackDto with auto-generated fields
 * Omits sensitive apiKey - used in GET /feedbacks endpoints for non-admin users
 * Uses IntersectionType to combine BaseFeedbackDto fields with auto-generated fields
 */
@ApiInternal()
@ApiExtraModels(BaseFeedbackDto, FeedbackGeneratedFieldsDto)
export class FeedbackResponseDto extends IntersectionType(BaseFeedbackDto, FeedbackGeneratedFieldsDto) {}
