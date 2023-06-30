import { Controller, Get, Param, Post } from '@nestjs/common';
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
  signUp(): Promise<UserDocument> {
    return this.usersService.signUp();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.findOne(id);
  }
}
