import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    const postToCreate = new this.postModel(createPostDto);
    const res = await postToCreate.save();

    const user = await this.usersService.getUser(createPostDto.user);
    user.posts.push(postToCreate);
    await user.save();

    return res;
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().populate('user').exec();
  }

  async findOne(id: string): Promise<PostDocument> {
    return this.postModel.findById(id).populate('user').exec();
  }
}
