export type QuizMode = 'identify' | 'trend' | 'classify';

export interface IdentifyConfig {
  clue: string;
  correctElements: string[];
}

export interface TrendConfig {
  property: 'electronegativity' | 'atomicRadius' | 'ionizationEnergy';
  elements: string[];
  correctOrder: string[];
}

export interface ClassifyConfig {
  elements: string[];
  correctClassifications: Record<string, 'metal' | 'nonmetal' | 'metalloid'>;
}

export interface PeriodicTableQuiz {
  mode: QuizMode;
  config: IdentifyConfig | TrendConfig | ClassifyConfig;
}

export interface PeriodicTableResponse {
  mode: QuizMode;
  selectedElements?: string[];
  orderedElements?: string[];
  classifications?: Record<string, string>;
}
