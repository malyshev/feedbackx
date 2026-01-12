import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateFeedbackDto, FeedbackDetailResponseDto } from '../dto';
import { CreateFeedbackService } from '../services/create-feedback.service';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFeedbackModel } from '../models/create-feedback.model';
import { FeedbackEntity } from '../entities/feedback.entity';

@ApiTags('Feedback')
@ApiConsumes('application/json')
@Controller('feedbacks')
export class CreateFeedbackController {
    constructor(private readonly createFeedbackService: CreateFeedbackService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new feedback collection.',
        description: 'Creates a new feedback collection with a unique key and generated API key.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: FeedbackDetailResponseDto,
        description: 'The request has been fulfilled and resulted in a new resource being created.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            'Occurs when the request body contains invalid data, missing required fields, or the feedback collection name/key already exists.',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred while creating the feedback collection.',
    })
    public async create(@Body() dto: CreateFeedbackDto): Promise<FeedbackDetailResponseDto> {
        // Map DTO to domain model
        const model = this.dtoToModel(dto);

        // Call service with domain model
        const feedback = await this.createFeedbackService.create(model);

        // Map entity to response DTO
        return this.modelToDto(feedback);
    }

    /**
     * Maps DTO to domain model
     * Transport layer → Domain layer
     */
    private dtoToModel(dto: CreateFeedbackDto): CreateFeedbackModel {
        return {
            name: dto.name,
            key: dto.key,
            description: dto.description,
            scale: dto.scale,
            metadata: dto.metadata,
        };
    }

    /**
     * Maps entity to response DTO
     * Persistence layer → Transport layer
     */
    private modelToDto(entity: FeedbackEntity): FeedbackDetailResponseDto {
        return plainToInstance(FeedbackDetailResponseDto, entity, {
            excludeExtraneousValues: true,
        });
    }
}
