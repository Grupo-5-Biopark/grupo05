import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateCourseNameException extends HttpException {
  constructor(name: string) {
    super(`Course with name '${name}' already exists`, HttpStatus.CONFLICT);
    this.name = 'DuplicateCourseNameException';
  }
}
