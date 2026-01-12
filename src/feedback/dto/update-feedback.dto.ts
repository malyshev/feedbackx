import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedbackDto } from './create-feedback.dto';

/**
 * Update Feedback DTO
 * All fields are optional - allows partial updates to feedback collection configuration
 * Uses PartialType to inherit validation from CreateFeedbackDto
 */
export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {}
