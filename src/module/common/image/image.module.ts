import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';

@Module({
  imports: [],
  controllers: [ImageController],
})
export class ImageModule {}
