import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { UserDocument } from './schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll(): Promise<UserDocument[]> {
    return this.usersService.findAll();
  }

  @Post('sign-up')
  signUp(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ user: UserDocument; token: string }> {
    console.log('signUp');

    return this.usersService.signUp(name, email, password);
  }

  @Post('sign-in')
  signIn(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ user: UserDocument; token: string }> {
    return this.usersService.signIn(email, password);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.findOne(id);
  }

  @Post('verify-token')
  verifyToken(
    @Headers('authorization') token: string,
  ): Promise<UserDocument | undefined> {
    return this.usersService.verifyToken(token);
  }
}
