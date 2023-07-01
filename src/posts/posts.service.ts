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
    const session = await this.postModel.db.startSession();
    session.startTransaction();
    try {
      // 画像処理、エラーが出たらロールバック
      // if (createPostDto.image) {
      //   createPostDto.image = saveImage(createPostDto.image);
      // }
      const postToCreate = new this.postModel(createPostDto);
      const newPost = await postToCreate.save();
      const user = await this.usersService.findOne(createPostDto.user);
      // TODO:pushの引数はnewPost._idであるべき？
      user.posts.push(newPost);
      await user.save();

      return newPost;
    } catch (err) {
      await session.abortTransaction();
      console.log({ err });

      throw new Error('create post failed');
    } finally {
      session.endSession();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.postModel.findByIdAndDelete(id).exec();
    } catch (error) {
      console.log({ error });
      throw new Error('delete post failed');
    }
  }

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().populate('user').exec();
  }

  async findOne(id: string): Promise<PostDocument> {
    return this.postModel.findById(id).populate('user').exec();
  }
}
