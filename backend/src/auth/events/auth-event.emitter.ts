import { Injectable } from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { AuthEvents } from './auth-events.enum';
import { UserLoggedInEvent } from './definitions/user-logged-in.event';
import { UserRegisteredEvent } from './definitions/user-registered.event';

@Injectable()
export class AuthEventEmitter {
  public constructor(private readonly eventEmitter: EventEmitter) {}

  public async emitUserLoggedInEvent(payload: UserLoggedInEvent): Promise<void> {
    await this.eventEmitter.emit(AuthEvents.UserLoggedInEvent, payload);
  }

  public async emitUserRegisteredEvent(payload: UserRegisteredEvent): Promise<void> {
    await this.eventEmitter.emit(AuthEvents.UserRegistered, payload);
  }
}
