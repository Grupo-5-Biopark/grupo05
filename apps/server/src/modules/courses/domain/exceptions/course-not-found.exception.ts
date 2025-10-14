export class CourseNotFoundException extends Error {
  constructor(id: number) {
    super(`Course with ID ${id} not found`);
    this.name = 'CourseNotFoundException';
  }
}
