import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDocument } from './schema';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditPostDto } from './dto/edit-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(): Promise<PostDocument[]> {
    return this.postsService.findAll();
  }

  @Get('except/private')
  findAllExceptPrivate(): Promise<PostDocument[]> {
    return this.postsService.findAllExceptPrivate();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostDocument> {
    return this.postsService.findOne(id);
  }

  @Get('user/:id')
  findAllByUser(@Param('id') userId: string): Promise<PostDocument[]> {
    return this.postsService.findAllByUser(userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image,
  ): Promise<PostDocument> {
    return this.postsService.create({ ...createPostDto, image });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  edit(
    @Param('id') id: string,
    @Body() editPostDto: EditPostDto,
    @UploadedFile() image,
  ): Promise<PostDocument> {
    return this.postsService.edit(id, { ...editPostDto, image });
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.postsService.delete(id);
  }
}
