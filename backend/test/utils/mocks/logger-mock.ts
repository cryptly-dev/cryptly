import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMock {
  public readonly entries: { level: string; data: unknown[] }[] = [];

  error(...data: unknown[]): void {
    this.entries.push({ level: 'error', data });
  }
  warn(...data: unknown[]): void {
    this.entries.push({ level: 'warn', data });
  }
  info(): void {}
  log(): void {}
  http(...data: unknown[]): void {
    this.entries.push({ level: 'http', data });
  }
  verbose(): void {}
  debug(): void {}
  silly(): void {}
}
