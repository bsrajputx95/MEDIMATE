import { BodyPart, NutrientSuggestion, LifestyleSuggestion } from '@/types/healthyics';

export const defaultBodyParts: BodyPart[] = [
  {
    id: '1',
    name: 'Heart',
    icon: 'heart',
    color: '#ff6b9d',
    exampleIssue: 'chest pain when running'
  },
  {
    id: '2',
    name: 'Kidneys',
    icon: 'kidney',
    color: '#c084fc',
    exampleIssue: 'kidney stones'
  },
  {
    id: '3',
    name: 'Bones',
    icon: 'bone',
    color: '#fbbf24',
    exampleIssue: 'joint pain and stiffness'
  },
  {
    id: '4',
    name: 'Skin',
    icon: 'user',
    color: '#fb7185',
    exampleIssue: 'acne and rashes'
  },
  {
    id: '5',
    name: 'Gut',
    icon: 'circle',
    color: '#34d399',
    exampleIssue: 'digestion problems'
  },
  {
    id: '6',
    name: 'Lungs',
    icon: 'wind',
    color: '#60a5fa',
    exampleIssue: 'breathing problems'
  },
  {
    id: '7',
    name: 'Eyes',
    icon: 'eye',
    color: '#a78bfa',
    exampleIssue: 'blurry vision'
  },
  {
    id: '8',
    name: 'Brain',
    icon: 'brain',
    color: '#f472b6',
    exampleIssue: 'migraines and memory loss'
  }
];

export const commonNutrientSuggestions: NutrientSuggestion[] = [
  {
    id: '1',
    name: 'Magnesium',
    description: 'Helps with muscle function and energy production',
    icon: 'leaf'
  },
  {
    id: '2',
    name: 'Omega-3',
    description: 'Supports heart and brain health',
    icon: 'fish'
  },
  {
    id: '3',
    name: 'Vitamin D',
    description: 'Essential for bone health and immune function',
    icon: 'sun'
  },
  {
    id: '4',
    name: 'Iron',
    description: 'Important for blood health and energy levels',
    icon: 'droplet'
  },
  {
    id: '5',
    name: 'Vitamin C',
    description: 'Boosts immune system and skin health',
    icon: 'orange'
  }
];

export const commonLifestyleSuggestions: LifestyleSuggestion[] = [
  {
    id: '1',
    title: 'Increase Water Intake',
    description: 'Drink at least 8 glasses of water daily',
    icon: 'droplets'
  },
  {
    id: '2',
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate activity daily',
    icon: 'activity'
  },
  {
    id: '3',
    title: 'Better Sleep',
    description: 'Get 7-9 hours of quality sleep each night',
    icon: 'moon'
  },
  {
    id: '4',
    title: 'Reduce Stress',
    description: 'Practice meditation or deep breathing exercises',
    icon: 'heart'
  },
  {
    id: '5',
    title: 'Balanced Diet',
    description: 'Include more fruits and vegetables in your meals',
    icon: 'apple'
  }
];