import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDocument } from './schema';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAll(): Promise<PostDocument[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<PostDocument> {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image,
  ): Promise<PostDocument> {
    console.log({ image });

    return this.postsService.create({ ...createPostDto, image });
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.postsService.delete(id);
  }
}
