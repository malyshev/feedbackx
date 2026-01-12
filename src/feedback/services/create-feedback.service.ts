import { Injectable } from '@nestjs/common';
import { FeedbackEntity } from '../entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationException } from '../../common/exceptions';
import { CreateFeedbackModel } from '../models/create-feedback.model';
import { randomBytes } from 'crypto';

@Injectable()
export class CreateFeedbackService {
    constructor(@InjectRepository(FeedbackEntity) private readonly repository: Repository<FeedbackEntity>) {}

    async create(model: CreateFeedbackModel): Promise<FeedbackEntity> {
        await this.assertNameAndKeyUnique(model.name, model.key);

        // Generate a secure random API key
        const apiKey = this.generateApiKey();

        // Save feedback collection with API key (stored as plain text for now)
        return this.repository.save({ ...model, apiKey });
    }

    /**
     * Validates that the feedback collection name and key do not already exist
     * Checks both fields in a single query for efficiency
     * @param name - Feedback collection name to check
     * @param key - Feedback collection key to check
     * @throws ValidationException if name or key already exists
     */
    private async assertNameAndKeyUnique(name: string, key: string): Promise<void> {
        const existingFeedback = await this.repository.findOne({
            where: [{ name }, { key }],
        });

        if (existingFeedback) {
            const errors: { [key: string]: string } = {};
            if (existingFeedback.name === name) {
                errors.name = `Feedback collection name "${name}" already taken`;
            }
            if (existingFeedback.key === key) {
                errors.key = `Feedback collection key "${key}" already taken`;
            }
            throw new ValidationException(errors);
        }
    }

    /**
     * Generates a secure random API key with prefix
     * Format: fx_{64 hex characters}
     * Example: fx_a1b2c3d4e5f6...
     *
     * @returns Secure random API key string
     */
    private generateApiKey(): string {
        // Generate 32 random bytes = 64 hex characters for strong security
        return `fx_${randomBytes(32).toString('hex')}`;
    }
}
