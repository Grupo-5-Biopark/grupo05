export class DuplicateCourseNameException extends Error {
  constructor(name: string) {
    super(`Course with name '${name}' already exists`);
    this.name = 'DuplicateCourseNameException';
  }
}
