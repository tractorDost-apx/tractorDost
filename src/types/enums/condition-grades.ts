export const ConditionGrade = {
  EXCELLENT: 'EXCELLENT',
  VERY_GOOD: 'VERY_GOOD',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
} as const;

export type ConditionGrade = (typeof ConditionGrade)[keyof typeof ConditionGrade];

export const CONDITION_GRADES: {
  grade: ConditionGrade;
  label: string;
  scoreRange: string;
  description: string;
}[] = [
  {
    grade: 'EXCELLENT',
    label: 'Grade A+ (Excellent)',
    scoreRange: '90 - 100',
    description: 'Like new condition, pristine engine compression, original paint, 80%+ tyre tread remaining.',
  },
  {
    grade: 'VERY_GOOD',
    label: 'Grade A (Very Good)',
    scoreRange: '75 - 89',
    description: 'Minor cosmetic signs of normal usage. Engine and hydraulics operate smoothly without fluid leaks.',
  },
  {
    grade: 'GOOD',
    label: 'Grade B (Good)',
    scoreRange: '60 - 74',
    description: 'Fully operational working tractor. Normal wear and tear on tyres and seat upholstery.',
  },
  {
    grade: 'FAIR',
    label: 'Grade C (Fair)',
    scoreRange: '40 - 59',
    description: 'Requires minor tune-up or tyre replacement soon. Engine starts reliably.',
  },
  {
    grade: 'POOR',
    label: 'Grade D (Needs Repair)',
    scoreRange: '< 40',
    description: 'Needs mechanical repairs to gearbox, clutch, or hydraulic pump.',
  },
];
