import { ScaleModel } from './scale.model';

/**
 * Create Feedback Model
 * Domain model representing the data needed to create a new feedback collection
 * Pure domain model - no decorators, no transport concerns
 * This is the source of truth for feedback collection creation data
 */
export class CreateFeedbackModel {
    public name!: string;
    public key!: string;
    public description?: string;
    public scale!: ScaleModel;
    public metadata?: Record<string, unknown>;
}
