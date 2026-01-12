import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackService } from './create-feedback.service';
import { FeedbackEntity } from '../entities/feedback.entity';
import { CreateFeedbackModel, ScaleType, NumericScaleModel } from '../models';
import { ValidationException } from '../../common/exceptions';

describe('CreateFeedbackService', () => {
    let service: CreateFeedbackService;
    let repository: jest.Mocked<Repository<FeedbackEntity>>;

    const mockRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        exists: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateFeedbackService,
                {
                    provide: getRepositoryToken(FeedbackEntity),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CreateFeedbackService>(CreateFeedbackService);
        repository = module.get(getRepositoryToken(FeedbackEntity));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const mockCreateModel: CreateFeedbackModel = {
            name: 'Test Feedback',
            key: 'test-feedback',
            description: 'Test description',
            scale: {
                type: ScaleType.NUMERIC,
                min: 0,
                max: 10,
            } as NumericScaleModel,
        };

        const mockSavedFeedback: FeedbackEntity = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Feedback',
            key: 'test-feedback',
            description: 'Test description',
            apiKey: 'fx_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            scale: {
                type: ScaleType.NUMERIC,
                min: 0,
                max: 10,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        } as FeedbackEntity;

        it('should create a feedback collection with generated API key', async () => {
            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue(mockSavedFeedback);

            const result = await service.create(mockCreateModel);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: [{ name: 'Test Feedback' }, { key: 'test-feedback' }],
            });
            expect(repository.save).toHaveBeenCalledWith({
                ...mockCreateModel,
                apiKey: expect.stringMatching(/^fx_[a-f0-9]{64}$/),
            });
            expect(result).toEqual(mockSavedFeedback);
            expect(result.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
        });

        it('should throw ValidationException if name already exists', async () => {
            const existingFeedback: FeedbackEntity = {
                id: 'existing-id',
                name: 'Test Feedback',
                key: 'different-key',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as FeedbackEntity;

            repository.findOne.mockResolvedValue(existingFeedback);

            await expect(service.create(mockCreateModel)).rejects.toThrow(ValidationException);
            await expect(service.create(mockCreateModel)).rejects.toThrow(
                'Feedback collection name "Test Feedback" already taken',
            );

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should throw ValidationException if key already exists', async () => {
            const existingFeedback: FeedbackEntity = {
                id: 'existing-id',
                name: 'Different Name',
                key: 'test-feedback',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as FeedbackEntity;

            repository.findOne.mockResolvedValue(existingFeedback);

            await expect(service.create(mockCreateModel)).rejects.toThrow(ValidationException);
            await expect(service.create(mockCreateModel)).rejects.toThrow(
                'Feedback collection key "test-feedback" already taken',
            );

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should throw ValidationException with both errors if name and key both exist', async () => {
            const existingFeedback: FeedbackEntity = {
                id: 'existing-id',
                name: 'Test Feedback',
                key: 'test-feedback',
                apiKey: 'existing-key',
                scale: { type: 'numeric', min: 0, max: 10 },
                createdAt: new Date(),
                updatedAt: new Date(),
            } as FeedbackEntity;

            repository.findOne.mockResolvedValue(existingFeedback);

            await expect(service.create(mockCreateModel)).rejects.toThrow(ValidationException);

            try {
                await service.create(mockCreateModel);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationException);
                expect(error.errors).toEqual({
                    name: 'Feedback collection name "Test Feedback" already taken',
                    key: 'Feedback collection key "test-feedback" already taken',
                });
            }

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should generate different API keys for each feedback collection', async () => {
            repository.findOne.mockResolvedValue(null);
            repository.save.mockImplementation((entity) =>
                Promise.resolve({
                    ...entity,
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as FeedbackEntity),
            );

            const result1 = await service.create(mockCreateModel);
            const result2 = await service.create({ ...mockCreateModel, key: 'another-feedback' });

            expect(result1.apiKey).not.toBe(result2.apiKey);
            expect(result1.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
            expect(result2.apiKey).toMatch(/^fx_[a-f0-9]{64}$/);
        });

        it('should pass through all fields from model to save', async () => {
            const feedbackWithMetadata: CreateFeedbackModel = {
                ...mockCreateModel,
                metadata: { customField: 'customValue' },
            };

            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue({
                ...mockSavedFeedback,
                metadata: { customField: 'customValue' },
            });

            await service.create(feedbackWithMetadata);

            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Feedback',
                    key: 'test-feedback',
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
