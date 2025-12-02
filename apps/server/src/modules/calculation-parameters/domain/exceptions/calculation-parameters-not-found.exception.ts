export class CalculationParametersNotFoundException extends Error {
  constructor(id?: number) {
    super(
      id
        ? `Calculation parameters with ID ${id} not found.`
        : 'Calculation parameters not found.',
    );
    this.name = 'CalculationParametersNotFoundException';
  }
}
