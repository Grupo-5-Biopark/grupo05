export class InvalidRoomsDataException extends Error {
  constructor(message: string) {
    super(`Invalid room data: ${message}`);
    this.name = 'InvalidRoomsDataException';
  }
}
