import { Module } from '@nestjs/common';
import { CreateFeedbackService } from './services/create-feedback.service';
import { CreateFeedbackController } from './controllers/create-feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEntity } from './entities/feedback.entity';
import { FeedbackItemEntity } from './entities/feedback-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FeedbackEntity, FeedbackItemEntity])],
    providers: [CreateFeedbackService],
    controllers: [CreateFeedbackController],
})
export class FeedbackModule {}
