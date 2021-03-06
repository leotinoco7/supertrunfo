import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError } from 'src/utils/handle-error.util';
import { isAdmin } from 'src/utils/is-admin.util';
import { notFoundError } from 'src/utils/not-found.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const userList = await this.prisma.user.findMany();

    const userEmail = userList.filter((user) => user.email === dto.email);

    const userCPF = userList.filter((user) => user.CPF === dto.CPF);

    if (userEmail.length > 0 || userCPF.length > 0) {
      throw new BadRequestException('This e-mail/CPF is already in use.');
    }

    const data: Prisma.UserCreateInput = {
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      CPF: dto.CPF,
      imageUrl: dto.imageUrl,
      ranking: dto.ranking,
      balance: dto.balance,
      isAdmin: dto.isAdmin,
    };

    return await this.prisma.user
      .create({
        data,
        select: {
          name: true,
          email: true,
          CPF: true,
          isAdmin: true,
          password: false,
          ranking: true,
          imageUrl: false,
          balance: true,
        },
      })
      .catch(handleError);
  }

  // -----------------------------------------------ADMIN------------------------------------------------

  async findAll(loggedUser) {
    isAdmin(loggedUser);

    return await this.prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          CPF: false,
          isAdmin: true,
          password: false,
          ranking: true,
          balance: true,
          imageUrl: false,
        },
      })
      .catch(handleError);
  }

  async findOne(id: string, isAdmin: boolean) {
    if (!isAdmin) {
      throw new UnauthorizedException('Access denied!');
    }
    const user = await this.prisma.user
      .findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          CPF: true,
          isAdmin: true,
          password: false,
          ranking: true,
          balance: true,
          imageUrl: true,
        },
      })
      .catch(handleError);

    notFoundError(user, `this user (${id})`);

    return user;
  }

  async remove(id: string, isAdmin: boolean) {
    if (!isAdmin) {
      throw new UnauthorizedException('Access denied!');
    }
    notFoundError(
      await this.prisma.user.findUnique({ where: { id } }),
      `this user (${id})`,
    );

    await this.prisma.user
      .delete({
        where: {
          id,
        },
      })
      .catch(handleError);
    return { message: 'User successfully deleted!' };
  }

  // -----------------------------------------------MY ACCOUNT------------------------------------------------

  async findMyAcc(loggedUser: string) {
    const user = await this.prisma.user
      .findUnique({
        where: {
          id: loggedUser,
        },
        select: {
          id: true,
          name: true,
          email: true,
          CPF: true,
          isAdmin: true,
          password: false,
          ranking: true,
          balance: true,
          imageUrl: true,
          deck: {
            select: {
              id: true,
              userToCard: {
                select: {
                  id: true,
                  card: {
                    select: {
                      id: true,
                      name: true,
                      rarity: true,
                      type: true,
                      cardAttack: true,
                      cardDef: true,
                      collection: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              utcs: true,
            },
          },
        },
      })
      .catch(handleError);

    return user;
  }

  async findMyAlbum(loggedUser: string) {
    const user = await this.prisma.user
      .findUnique({
        where: {
          id: loggedUser,
        },
        select: {
          id: true,
          name: true,
          utcs: {
            select: {
              id: true,
              card: {
                select: {
                  id: true,
                  name: true,
                  rarity: true,
                  type: true,
                  cardAttack: true,
                  cardDef: true,
                  collection: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .catch(handleError);

    return user;
  }

  async updateMyAcc(dto: UpdateUserDto, loggedUser: string) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const data: Prisma.UserUpdateInput = {
      ...dto,
    };

    return this.prisma.user
      .update({
        where: { id: loggedUser },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          CPF: true,
          isAdmin: true,
          password: false,
          ranking: true,
          balance: true,
          imageUrl: true,
        },
      })
      .catch(handleError);
  }

  async deleteMyAcc(loggedUser: string) {
    await this.prisma.user
      .delete({
        where: {
          id: loggedUser,
        },
      })
      .catch(handleError);
    return { message: 'Your account was successfully deleted!' };
  }
}
