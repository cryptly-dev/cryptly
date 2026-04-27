import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { CustomJwtService } from '../custom-jwt/custom-jwt.service';
import { RefreshTokenWriteService } from '../refresh-token/write/refresh-token-write.service';
import { ApproveCliSessionBody } from './dto/approve-session.body';
import { CliSessionStatus } from './core/entities/cli-session-status.enum';
import { CliSessionEntity } from './core/entities/cli-session.entity';

const SESSION_ID_BYTES = 16;
const SESSION_TTL_MS = 10 * 60 * 1000;

export interface StartSessionResult {
  publicId: string;
  expiresAt: Date;
}

export interface PollSessionResult {
  status: CliSessionStatus;
  jwt?: string;
  refreshToken?: string;
  wrappedKey?: string;
  encryptedPrivateKey?: string;
  userId?: string;
}

@Injectable()
export class CliFlowService {
  constructor(
    @InjectModel(CliSessionEntity.name)
    private readonly sessionModel: Model<CliSessionEntity>,
    private readonly jwtService: CustomJwtService,
    private readonly refreshTokenWriteService: RefreshTokenWriteService,
  ) {}

  public async start(params: {
    tempPublicKey: string;
    deviceName: string;
  }): Promise<StartSessionResult> {
    const publicId = randomBytes(SESSION_ID_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.sessionModel.create({
      publicId,
      tempPublicKey: params.tempPublicKey,
      deviceName: params.deviceName,
      status: CliSessionStatus.Pending,
      expiresAt,
    });

    return { publicId, expiresAt };
  }

  public async getInfo(publicId: string): Promise<CliSessionEntity> {
    const session = await this.findActiveOrThrow(publicId);
    return session;
  }

  public async approve(params: {
    publicId: string;
    userId: string;
    body: ApproveCliSessionBody;
  }): Promise<void> {
    const session = await this.findActiveOrThrow(params.publicId);

    if (session.status !== CliSessionStatus.Pending) {
      throw new ConflictException('Session is not pending');
    }

    await this.sessionModel.updateOne(
      { _id: session._id, status: CliSessionStatus.Pending },
      {
        status: CliSessionStatus.Approved,
        userId: new Types.ObjectId(params.userId),
        wrappedKey: params.body.wrappedKey,
        encryptedPrivateKey: params.body.encryptedPrivateKey,
      },
    );
  }

  /**
   * Atomically consume an approved session: marks it consumed, mints a JWT
   * + refresh token, and clears the wrapped key payload from storage. Polling
   * the same session again returns `consumed` with no payload, so an attacker
   * who later sees the session id can't replay.
   */
  public async pollAndConsume(publicId: string): Promise<PollSessionResult> {
    const session = await this.findActiveOrThrow(publicId);

    if (session.status === CliSessionStatus.Consumed) {
      return { status: CliSessionStatus.Consumed };
    }

    if (session.status === CliSessionStatus.Pending) {
      return { status: CliSessionStatus.Pending };
    }

    // status === Approved — atomic transition to Consumed prevents a second
    // poll from also reading the payload (the second loser sees Consumed).
    const consumed = await this.sessionModel.findOneAndUpdate(
      { _id: session._id, status: CliSessionStatus.Approved },
      {
        status: CliSessionStatus.Consumed,
        wrappedKey: null,
        encryptedPrivateKey: null,
      },
      { new: false },
    );

    if (!consumed || consumed.status !== CliSessionStatus.Approved) {
      return { status: CliSessionStatus.Consumed };
    }

    if (!consumed.userId || !consumed.wrappedKey || !consumed.encryptedPrivateKey) {
      throw new BadRequestException('Session approval payload missing');
    }

    const userId = consumed.userId.toString();
    const jwt = await this.jwtService.sign({ id: userId });
    const refresh = await this.refreshTokenWriteService.issue(userId);

    return {
      status: CliSessionStatus.Approved,
      jwt,
      refreshToken: refresh.rawToken,
      wrappedKey: consumed.wrappedKey,
      encryptedPrivateKey: consumed.encryptedPrivateKey,
      userId,
    };
  }

  private async findActiveOrThrow(publicId: string): Promise<CliSessionEntity> {
    const session = await this.sessionModel.findOne({ publicId }).lean<CliSessionEntity>().exec();
    if (!session) {
      throw new NotFoundException('CLI session not found');
    }
    if (session.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException('CLI session expired');
    }
    return session;
  }
}
