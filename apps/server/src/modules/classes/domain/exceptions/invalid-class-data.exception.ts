export class InvalidClassDataException extends Error {
  constructor(message: string) {
    super(`Invalid class data: ${message}`);
    this.name = 'InvalidClassDataException';
  }
}
