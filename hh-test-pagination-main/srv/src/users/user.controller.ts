import { UserService } from './users.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { UsersResponseDto } from './users.response.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(@Query('page') page: number = 1) {
    this.logger.log('Get all users');
    const limit: number = 20;
    const skip = (page - 1) * limit; // Calculate the number of records to skip
    const users = await this.userService.findAll(skip, limit);
    return users.map((user) => UsersResponseDto.fromUsersEntity(user));
  }

  @Get('count')
  async getUsersCount() {
    const userCounter = await this.userService.countAllUsers();
    return { counter: userCounter };
  }
}
