export class RoomsNotFoundException extends Error {
  constructor(id: number) {
    super(`Room with ID ${id} not found`);
    this.name = 'RoomsNotFoundException';
  }
}
