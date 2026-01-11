import { PartialType } from '@nestjs/mapped-types';
import { CreateRealmDto } from './create-realm.dto';

/**
 * Update Realm DTO
 * All fields are optional - allows partial updates to realm configuration
 * Uses PartialType to inherit validation from CreateRealmDto
 */
export class UpdateRealmDto extends PartialType(CreateRealmDto) {}
