import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRealmService } from './create-realm.service';
import { RealmEntity } from '../entities/realm.entity';
import { ValidationException } from '../../common/exceptions';

describe('CreateRealmService', () => {
    let service: CreateRealmService;
    let repository: jest.Mocked<Repository<RealmEntity>>;

    const mockRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        exists: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateRealmService,
                {
                    provide: getRepositoryToken(RealmEntity),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CreateRealmService>(CreateRealmService);
        repository = module.get(getRepositoryToken(RealmEntity));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handle', () => {
        const mockPartialRealm: Partial<RealmEntity> = {
            name: 'Test Realm',
            key: 'test-realm',
            description: 'Test description',
            scale: {
                type: 'numeric',
                min: 0,
                max: 10,
            },
        };

        const mockSavedRealm: RealmEntity = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Realm',
            key: 'test-realm',
            description: 'Test description',
            apiKey: 'fx_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            scale: {
                type: 'numeric',
                min: 0,
                max: 10,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        } as RealmEntity;

        it('should create a realm with generated API key', async () => {
            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue(mockSavedRealm);

            const result = await service.handle(mockPartialRealm);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: [{ name: 'Test Realm' }, { key: 'test-realm' }],
            });
            expect(repository.save).toHaveBeenCalledWith({
                ...mockPartialRealm,
                apiKey: expect.stringMatching(/^fx_[a-f0-9]{64}$/),
            });
            expect(result).toEqual(mockSavedRealm);
            expect(result.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
        });

        it('should throw ValidationException if name already exists', async () => {
            const existingRealm: RealmEntity = {
                id: 'existing-id',
                name: 'Test Realm',
                key: 'different-key',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as RealmEntity;

            repository.findOne.mockResolvedValue(existingRealm);

            await expect(service.handle(mockPartialRealm)).rejects.toThrow(ValidationException);
            await expect(service.handle(mockPartialRealm)).rejects.toThrow('Realm name "Test Realm" already taken');

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should throw ValidationException if key already exists', async () => {
            const existingRealm: RealmEntity = {
                id: 'existing-id',
                name: 'Different Name',
                key: 'test-realm',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as RealmEntity;

            repository.findOne.mockResolvedValue(existingRealm);

            await expect(service.handle(mockPartialRealm)).rejects.toThrow(ValidationException);
            await expect(service.handle(mockPartialRealm)).rejects.toThrow('Realm key "test-realm" already taken');

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should throw ValidationException with both errors if name and key both exist', async () => {
            const existingRealm: RealmEntity = {
                id: 'existing-id',
                name: 'Test Realm',
                key: 'test-realm',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as RealmEntity;

            repository.findOne.mockResolvedValue(existingRealm);

            await expect(service.handle(mockPartialRealm)).rejects.toThrow(ValidationException);

            try {
                await service.handle(mockPartialRealm);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.errors).toEqual({
                    name: 'Realm name "Test Realm" already taken',
                    key: 'Realm key "test-realm" already taken',
                });
            }

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should generate different API keys for each realm', async () => {
            repository.findOne.mockResolvedValue(null);
            repository.save.mockImplementation((entity) =>
                Promise.resolve({
                    ...entity,
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as RealmEntity),
            );

            const result1 = await service.handle(mockPartialRealm);
            const result2 = await service.handle({ ...mockPartialRealm, key: 'another-realm' });

            expect(result1.apiKey).not.toBe(result2.apiKey);
            expect(result1.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
            expect(result2.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
        });

        it('should pass through all fields from partialRealm to save', async () => {
            const realmWithMetadata: Partial<RealmEntity> = {
                ...mockPartialRealm,
                metadata: { customField: 'customValue' },
            };

            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue({
                ...mockSavedRealm,
                metadata: { customField: 'customValue' },
            });

            await service.handle(realmWithMetadata);

            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Realm',
                    key: 'test-realm',
                    description: 'Test description',
                    scale: {
                        type: 'numeric',
                        min: 0,
                        max: 10,
                    },
                    metadata: { customField: 'customValue' },
                    apiKey: expect.stringMatching(/^fx_[a-f0-9]{64}$/),
                }),
            );
        });
    });
});
