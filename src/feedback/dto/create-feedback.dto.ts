import { BaseFeedbackDto } from './base-feedback.dto';

/**
 * Create Feedback DTO
 * Used for creating a new feedback collection - inherits all fields from BaseFeedbackDto
 * Omits auto-generated fields (id, timestamps, apiKey)
 */
export class CreateFeedbackDto extends BaseFeedbackDto {}
