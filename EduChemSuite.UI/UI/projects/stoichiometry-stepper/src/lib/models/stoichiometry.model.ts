export interface ConversionStep {
  numerator: string;
  denominator: string;
}

export interface FinalAnswer {
  value: number;
  unit: string;
  tolerance: number;
}

export interface StoichiometryProblem {
  problemText: string;
  givenValue: number;
  givenUnit: string;
  steps: ConversionStep[];
  finalAnswer: FinalAnswer;
}
