export class DeviceMessageEvent {
  public constructor(
    public readonly deviceId: string,
    public readonly userId: string,
    public readonly message: any,
  ) {}
}
