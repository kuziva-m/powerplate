
export type Language = 'en' | 'sn' | 'nd';

export interface Nutrients {
  calories: string;
  protein: string;
  carbs: string;
  fiber: string;
  vitamins: string[];
  minerals: string[];
}

export interface Recipe {
  name: string;
  ingredients: string[];
  steps: string[];
  culturalNote: string;
  healthyPairings: string[];
  mealBalanceReason: string;
}

export interface ScanResult {
  foodName: string;
  description: string;
  nutrients: Nutrients;
  recipes: Recipe[];
  healthAdvice: string;
  seasonalInfo: string;
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  sn: "Shona (ChiShona)",
  nd: "Ndebele (isiNdebele)"
};
