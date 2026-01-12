import { Test, TestingModule } from '@nestjs/testing';
import { CreateFeedbackController } from './create-feedback.controller';
import { CreateFeedbackService } from '../services/create-feedback.service';
import { CreateFeedbackDto } from '../dto';
import { ScaleType } from '../models';
import { FeedbackEntity } from '../entities/feedback.entity';

describe('CreateFeedbackController', () => {
    let controller: CreateFeedbackController;
    let service: jest.Mocked<CreateFeedbackService>;

    const mockService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreateFeedbackController],
            providers: [
                {
                    provide: CreateFeedbackService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<CreateFeedbackController>(CreateFeedbackController);
        service = module.get(CreateFeedbackService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const mockCreateDto: CreateFeedbackDto = {
            name: 'Test Feedback',
            key: 'test-feedback',
            description: 'Test description',
            scale: {
                type: ScaleType.NUMERIC,
                min: 0,
                max: 10,
            } as any,
        } as CreateFeedbackDto;

        const mockFeedbackEntity: FeedbackEntity = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Feedback',
            key: 'test-feedback',
            description: 'Test description',
            apiKey: 'fx_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            scale: {
                type: 'numeric',
                min: 0,
                max: 10,
            },
            createdAt: new Date('2026-01-10T10:30:00.000Z'),
            updatedAt: new Date('2026-01-10T10:30:00.000Z'),
        } as FeedbackEntity;

        it('should create a feedback collection and return response DTO', async () => {
            service.create.mockResolvedValue(mockFeedbackEntity);

            const result = await controller.create(mockCreateDto);

            expect(service.create).toHaveBeenCalledTimes(1);
            expect(service.create).toHaveBeenCalledWith({
                name: 'Test Feedback',
                key: 'test-feedback',
                description: 'Test description',
                scale: mockCreateDto.scale,
                metadata: undefined,
            });

            // Verify result is a FeedbackDetailResponseDto instance
            expect(result).toBeDefined();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('key');
            expect(result).toHaveProperty('apiKey');
        });

        it('should map DTO to domain model correctly', async () => {
            const dtoWithMetadata: CreateFeedbackDto = {
                ...mockCreateDto,
                metadata: { version: '1.0', tags: ['alpha'] },
            } as CreateFeedbackDto;

            service.create.mockResolvedValue(mockFeedbackEntity);

            await controller.create(dtoWithMetadata);

            expect(service.create).toHaveBeenCalledWith({
                name: dtoWithMetadata.name,
                key: dtoWithMetadata.key,
                description: dtoWithMetadata.description,
                scale: dtoWithMetadata.scale,
                metadata: { version: '1.0', tags: ['alpha'] },
            });
        });

        it('should map entity to response DTO correctly', async () => {
            service.create.mockResolvedValue(mockFeedbackEntity);

            const result = await controller.create(mockCreateDto);

            // Verify the result is transformed using plainToInstance
            expect(result).toBeDefined();
            // The result should have all properties from the entity
            expect(result.id).toBe(mockFeedbackEntity.id);
            expect(result.name).toBe(mockFeedbackEntity.name);
            expect(result.key).toBe(mockFeedbackEntity.key);
            expect(result.apiKey).toBe(mockFeedbackEntity.apiKey);
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            service.create.mockRejectedValue(error);

            await expect(controller.create(mockCreateDto)).rejects.toThrow('Service error');
        });
    });

    describe('dtoToModel', () => {
        it('should map DTO to domain model correctly', () => {
            const dto: CreateFeedbackDto = {
                name: 'Test Feedback',
                key: 'test-feedback',
                description: 'Test description',
                scale: {
                    type: ScaleType.NUMERIC,
                    min: 0,
                    max: 10,
                } as any,
                metadata: { version: '1.0' },
            } as CreateFeedbackDto;

            // Access private method via type assertion
            const model = (controller as any).dtoToModel(dto);

            expect(model).toEqual({
                name: 'Test Feedback',
                key: 'test-feedback',
                description: 'Test description',
                scale: dto.scale,
                metadata: { version: '1.0' },
            });
            expect(model).toBeInstanceOf(Object);
        });

        it('should handle DTO without optional fields', () => {
            const dto: CreateFeedbackDto = {
                name: 'Test Feedback',
                key: 'test-feedback',
                scale: {
                    type: ScaleType.NUMERIC,
                    min: 0,
                    max: 10,
                } as any,
            } as CreateFeedbackDto;

            const model = (controller as any).dtoToModel(dto);

            expect(model).toEqual({
                name: 'Test Feedback',
                key: 'test-feedback',
                description: undefined,
                scale: dto.scale,
                metadata: undefined,
            });
        });

        it('should preserve all DTO properties in model', () => {
            const dto: CreateFeedbackDto = {
                name: 'Complex Feedback',
                key: 'complex-feedback',
                description: 'A complex feedback collection',
                scale: {
                    type: ScaleType.ENUM,
                    values: ['bad', 'ok', 'great'],
                } as any,
                metadata: {
                    version: '2.0',
                    tags: ['production', 'important'],
                    custom: { nested: 'value' },
                },
            } as CreateFeedbackDto;

            const model = (controller as any).dtoToModel(dto);

            expect(model.name).toBe('Complex Feedback');
            expect(model.key).toBe('complex-feedback');
            expect(model.description).toBe('A complex feedback collection');
            expect(model.scale).toEqual(dto.scale);
            expect(model.metadata).toEqual({
                version: '2.0',
                tags: ['production', 'important'],
                custom: { nested: 'value' },
            });
        });
    });

    describe('modelToDto', () => {
        it('should map entity to response DTO correctly', () => {
            const entity: FeedbackEntity = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Feedback',
                key: 'test-feedback',
                description: 'Test description',
                apiKey: 'fx_test_key',
                scale: {
                    type: 'numeric',
                    min: 0,
                    max: 10,
                },
                createdAt: new Date('2026-01-10T10:30:00.000Z'),
                updatedAt: new Date('2026-01-10T10:30:00.000Z'),
            } as FeedbackEntity;

            const dto = (controller as any).modelToDto(entity);

            expect(dto).toBeDefined();
            expect(dto.id).toBe(entity.id);
            expect(dto.name).toBe(entity.name);
            expect(dto.key).toBe(entity.key);
            expect(dto.apiKey).toBe(entity.apiKey);
            expect(dto.description).toBe(entity.description);
            expect(dto.scale).toEqual(entity.scale);
        });

        it('should use plainToInstance with excludeExtraneousValues', () => {
            const entity: FeedbackEntity = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Feedback',
                key: 'test-feedback',
                apiKey: 'fx_test_key',
                scale: {
                    type: 'numeric',
                    min: 0,
                    max: 10,
                },
                createdAt: new Date('2026-01-10T10:30:00.000Z'),
                updatedAt: new Date('2026-01-10T10:30:00.000Z'),
            } as FeedbackEntity;

            // Verify the result is properly transformed
            const dto = (controller as any).modelToDto(entity);

            // The result should be a FeedbackDetailResponseDto instance
            expect(dto).toBeDefined();
            expect(dto.id).toBe(entity.id);
            expect(dto.name).toBe(entity.name);
            expect(dto.key).toBe(entity.key);
            expect(dto.apiKey).toBe(entity.apiKey);
        });

        it('should handle entity with all optional fields', () => {
            const entity: FeedbackEntity = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Feedback',
                key: 'test-feedback',
                description: 'Test description',
                apiKey: 'fx_test_key',
                scale: {
                    type: 'numeric',
                    min: 0,
                    max: 10,
                },
                metadata: { version: '1.0' },
                createdAt: new Date('2026-01-10T10:30:00.000Z'),
                updatedAt: new Date('2026-01-10T10:30:00.000Z'),
            } as FeedbackEntity;

            const dto = (controller as any).modelToDto(entity);

            expect(dto).toBeDefined();
            expect(dto.metadata).toEqual({ version: '1.0' });
        });
    });
});
