import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
  findOne(id): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async signIn(email: string, rawPassword: string) {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new UnauthorizedException('ユーザーが存在しません');
      }

      const isPasswordValid = this.comparePassword(rawPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('パスワードが一致しません');
      }

      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async signUp(name: string, email: string, password: string) {
    console.log({ name, email, password });

    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      const hashedPassword = this.hashPassword(password);
      const userToCreate = new this.userModel({
        name,
        email,
        password: hashedPassword,
      });
      const user = await userToCreate.save({ session });

      const token = this.generateToken(user);
      console.log({ token });

      await session.commitTransaction();
      return { user, token };
    } catch (error) {
      if (session.inTransaction()) {
        session.abortTransaction();
      }
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  async verifyToken(token: string) {
    const decoded = this.decodeToken(token);

    if (!decoded) {
      return null;
    }
    const user = await this.userModel.findById(decoded.id).exec();
    if (!user) {
      return null;
    }
    return user;
  }

  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  private comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  private generateToken(user: any): string {
    return this.jwtService.sign({ id: user._id });
  }

  private decodeToken(bearerHeaders: string): null | { id: string } {
    if (!bearerHeaders) return null;
    const token = bearerHeaders.split(' ')[1];

    try {
      return this.jwtService.verify(token);
    } catch (error) {
      //tokenがinvalidな場合
      return null;
    }
  }
}
