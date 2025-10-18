import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { UserEntity } from '../core/entities/user.entity';
import { UserNormalized } from '../core/entities/user.interface';
import { UserSerializer } from '../core/entities/user.serializer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserWriteService {
  constructor(@InjectModel(UserEntity.name) private userModel: Model<UserEntity>) {}

  public async create(dto: CreateUserDto): Promise<UserNormalized> {
    const user = await this.userModel.create({
      email: dto.email,
      authMethod: dto.authMethod,
      avatarUrl: dto.avatarUrl,
    });

    return UserSerializer.normalize(user);
  }

  public async update(id: string, dto: UpdateUserDto): Promise<UserNormalized> {
    const updateQuery: UpdateQuery<UserEntity> = {};

    if (dto.displayName !== undefined) {
      updateQuery.displayName = dto.displayName;
    }

    if (dto.publicKey) {
      updateQuery.publicKey = dto.publicKey;
    }

    if (dto.privateKeyEncrypted) {
      updateQuery.privateKeyEncrypted = dto.privateKeyEncrypted;
    }

    if (dto.projectsOrder) {
      updateQuery.projectsOrder = dto.projectsOrder;
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      updateQuery,
      { new: true },
    );

    if (!user) {
      throw new Error(`User with id ${id} not found for update`);
    }

    return UserSerializer.normalize(user);
  }

  public async deleteKeys(id: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $unset: { publicKey: null, privateKeyEncrypted: null } },
    );
  }

  public async updateProjectsOrder(id: string, projectIds: string[]): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { projectsOrder: projectIds },
    );
  }

  public async addToProjectsOrder(id: string, projectId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $push: { projectsOrder: projectId } },
    );
  }

  public async removeFromProjectsOrder(id: string, projectId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $pull: { projectsOrder: projectId } },
    );
  }
}
