export class CalculationParametersNotFoundException extends Error {
  constructor(id?: number) {
    super(`Calculation parameters${id ? ` with id ${id}` : ''} not found`);
  }
}
