export interface BodyPart {
  id: string;
  name: string;
  icon: string;
  color: string;
  exampleIssue: string;
}

export interface HealthIssue {
  id: string;
  bodyPartId: string;
  description: string;
  timestamp: Date;
}

export interface NutrientSuggestion {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LifestyleSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  nutrients: NutrientSuggestion[];
  lifestyle: LifestyleSuggestion[];
}