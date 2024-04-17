import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
  ) {}

  // get list of all users
  async findAll(skip = 0, take = 20): Promise<UsersEntity[]> {
    return await this.usersRepo.find({
      skip: skip,
      take: take,
    });
  }

  async countAllUsers(): Promise<number> {
    return this.usersRepo.count();
  }
}
