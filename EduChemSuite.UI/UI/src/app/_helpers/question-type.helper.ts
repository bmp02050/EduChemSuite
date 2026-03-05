export function isDiagramQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('chemical structure') || desc.includes('diagram') || desc.includes('molecule');
}

export function isAtomicStructureQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('atomic structure') || desc.includes('bohr model');
}

export function isChemicalEquationQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('chemical equation') || desc.includes('equation balancing');
}

export function isElectronConfigQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('electron configuration');
}

export function isLewisStructureQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('lewis structure') || desc.includes('lewis dot');
}

export function isPeriodicTableQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('periodic table');
}

export function isStoichiometryQuestion(questionTypeDescription?: string | null): boolean {
  if (!questionTypeDescription) return false;
  const desc = questionTypeDescription.toLowerCase();
  return desc.includes('stoichiometry');
}

export function isInteractiveToolQuestion(questionTypeDescription?: string | null): boolean {
  return isDiagramQuestion(questionTypeDescription)
    || isAtomicStructureQuestion(questionTypeDescription)
    || isChemicalEquationQuestion(questionTypeDescription)
    || isElectronConfigQuestion(questionTypeDescription)
    || isLewisStructureQuestion(questionTypeDescription)
    || isPeriodicTableQuestion(questionTypeDescription)
    || isStoichiometryQuestion(questionTypeDescription);
}
