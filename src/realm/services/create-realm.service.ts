import { Injectable } from '@nestjs/common';
import { RealmEntity } from '../entities/realm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationException } from '../../common/exceptions';
import { randomBytes } from 'crypto';

@Injectable()
export class CreateRealmService {
    constructor(@InjectRepository(RealmEntity) private readonly repository: Repository<RealmEntity>) {}

    async handle(partialRealm: Partial<RealmEntity>): Promise<RealmEntity> {
        await this.assertNameAndKeyUnique(partialRealm.name!, partialRealm.key!);

        // Generate a secure random API key
        const apiKey = this.generateApiKey();

        // Save realm with API key (stored as plain text for now)
        return this.repository.save({ ...partialRealm, apiKey });
    }

    /**
     * Validates that the realm name and key do not already exist
     * Checks both fields in a single query for efficiency
     * @param name - Realm name to check
     * @param key - Realm key to check
     * @throws ValidationException if name or key already exists
     */
    private async assertNameAndKeyUnique(name: string, key: string): Promise<void> {
        const existingRealm = await this.repository.findOne({
            where: [{ name }, { key }],
        });

        if (existingRealm) {
            const errors: { [key: string]: string } = {};
            if (existingRealm.name === name) {
                errors.name = `Realm name "${name}" already taken`;
            }
            if (existingRealm.key === key) {
                errors.key = `Realm key "${key}" already taken`;
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
