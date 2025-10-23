export class ClassNotFoundException extends Error {
  constructor(id: number) {
    super(`Class with ID ${id} not found`);
    this.name = 'ClassNotFoundException';
  }
}
