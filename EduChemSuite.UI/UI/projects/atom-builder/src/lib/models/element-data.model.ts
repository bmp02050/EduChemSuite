// Re-export from shared chemistry-data library
export { ElementData, getShellMax, ELEMENTS, getElementBySymbol, getElementByNumber } from 'chemistry-data';
import { ELEMENTS as ALL_ELEMENTS, ElementData } from 'chemistry-data';

/** First 36 elements (H through Kr) — used by the atom-builder element picker */
export const ELEMENTS_36: ElementData[] = ALL_ELEMENTS.filter(e => e.atomicNumber <= 36);
