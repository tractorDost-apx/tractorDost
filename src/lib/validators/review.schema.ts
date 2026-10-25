export interface CreateReviewFormValues {
  overallRating: number;
  serviceQuality?: number;
  responseTime?: number;
  afterSalesSupport?: number;
  mechanicQuality?: number;
  priceFairness?: number;
  turnaroundTime?: number;
  headline?: string;
  body?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateReview(values: CreateReviewFormValues): ValidationResult<CreateReviewFormValues> {
  const errors: Partial<Record<keyof CreateReviewFormValues, string>> = {};

  if (!values.overallRating || values.overallRating < 1 || values.overallRating > 5) {
    errors.overallRating = 'Rating must be between 1 and 5 stars';
  }

  const subscores: (keyof CreateReviewFormValues)[] = [
    'serviceQuality',
    'responseTime',
    'afterSalesSupport',
    'mechanicQuality',
    'priceFairness',
    'turnaroundTime',
  ];

  for (const field of subscores) {
    const val = values[field] as number | undefined;
    if (val !== undefined && (val < 1 || val > 5)) {
      errors[field] = 'Subscore must be between 1 and 5';
    }
  }

  if (values.headline && values.headline.trim().length > 150) {
    errors.headline = 'Headline must be under 150 characters';
  }

  if (values.body && values.body.trim().length > 2000) {
    errors.body = 'Review text must be under 2000 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
