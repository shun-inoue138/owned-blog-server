import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EditPostDto } from './dto/edit-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    const session = await this.postModel.db.startSession();
    session.startTransaction();
    let fileName;
    try {
      // TODO:server側のローカルディレクトリに画像を保存するという手法は特殊なため、この辺りの処理はもっと抽象化したい
      if (createPostDto.image) {
        fileName = this.saveImage(createPostDto.image);
      }
      const postToCreate = new this.postModel({
        ...createPostDto,
        image: fileName,
      });

      const newPost = await postToCreate.save();
      const user = await this.usersService.findOne(createPostDto.user);
      // TODO:pushの引数はnewPost._idであるべき？
      user.posts.push(newPost);
      await user.save();

      return newPost;
    } catch (err) {
      await session.abortTransaction();
      if (fileName) this.undoSaveImage(fileName);
      throw new Error('create post failed');
    } finally {
      session.endSession();
    }
  }

  async edit(postId: string, editPostDto: EditPostDto): Promise<PostDocument> {
    const session = await this.postModel.db.startSession();
    session.startTransaction();
    // TODO:// TODO:変更があった場合のみserverで受け取る。

    let newFileName;
    try {
      if (editPostDto.image) {
        newFileName = this.saveImage(editPostDto.image);
      }
      const postToEdit = await this.postModel.findById(postId).exec();
      if (!postToEdit) throw new Error('post not found');

      if (newFileName) {
        postToEdit.image = newFileName;
      }
      postToEdit.title = editPostDto.title;
      postToEdit.content = editPostDto.content;
      postToEdit.isPrivate = editPostDto.isPrivate;

      await postToEdit.save();
      return postToEdit;
    } catch (err) {
      await session.abortTransaction();
      if (newFileName) this.undoSaveImage(newFileName);
      throw new Error('edit post failed');
    } finally {
      session.endSession();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.postModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error('delete post failed');
    }
  }

  async findAll(): Promise<PostDocument[]> {
    //updatedAt新しい順
    const posts = await this.postModel
      .find()
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
    console.log({ posts });

    return posts.map((post) => {
      if (!post.image) return post;
      post.image = this.getImageBase64(post);
      return post;
    });
  }

  async findAllExceptPrivate(): Promise<PostDocument[]> {
    console.log('findAllExceptPrivate');

    const posts = await this.postModel
      .find({ isPrivate: false })
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
    return posts.map((post) => {
      if (!post.image) return post;
      post.image = this.getImageBase64(post);
      return post;
    });
  }

  async findAllByUser(userId: string): Promise<PostDocument[]> {
    console.log(typeof userId);

    const posts = await this.postModel
      .find({ user: userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
    console.log({ posts });

    return posts.map((post) => {
      if (!post.image) return post;
      post.image = this.getImageBase64(post);
      return post;
    });
  }

  async findOne(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).populate('user').exec();
    if (!post.image) return post;
    post.image = this.getImageBase64(post);

    return post;
  }

  private saveImage(image: Express.Multer.File): string {
    const uniqueFilename = uuidv4() + path.extname(image.originalname);
    const outputPath = path.resolve('postImages', uniqueFilename);
    fs.writeFileSync(outputPath, image.buffer);

    return uniqueFilename;
  }

  private undoSaveImage(fileName: string): void {
    const filePath = path.resolve('postImages', fileName);
    fs.unlinkSync(filePath);
  }

  private getImageBase64(post: PostDocument): string {
    const imagePath = path.join('postImages', post.image);
    const imageBuffer = fs.readFileSync(imagePath);

    return imageBuffer.toString('base64');
  }
}
