import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
