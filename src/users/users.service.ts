import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  getUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
  getUser(id): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  createUser(): Promise<UserDocument> {
    const userToCreate = new this.userModel({
      name: 'test1',
      email: 'hoge@fuga.com',
      password: '1234',
    });
    return userToCreate.save();
  }
}
