import { EmiCalculatorInputs, EmiValidationErrors } from './emi-calculator.types';
import { EMI_LIMITS } from './emi-calculator.constants';

export const validateEmiInputs = (inputs: EmiCalculatorInputs): EmiValidationErrors => {
  const errors: EmiValidationErrors = {};

  // Validate Vehicle Price
  if (isNaN(inputs.vehiclePrice) || inputs.vehiclePrice < EMI_LIMITS.VEHICLE_PRICE_MIN) {
    errors.vehiclePrice = `Price must be at least ₹${EMI_LIMITS.VEHICLE_PRICE_MIN.toLocaleString('en-IN')}`;
  } else if (inputs.vehiclePrice > EMI_LIMITS.VEHICLE_PRICE_MAX) {
    errors.vehiclePrice = `Price cannot exceed ₹${EMI_LIMITS.VEHICLE_PRICE_MAX.toLocaleString('en-IN')}`;
  }

  // Validate Down Payment
  const maxDownPayment = Math.floor(inputs.vehiclePrice * (EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT / 100));
  if (isNaN(inputs.downPayment) || inputs.downPayment < 0) {
    errors.downPayment = 'Down payment cannot be negative';
  } else if (inputs.downPayment > inputs.vehiclePrice) {
    errors.downPayment = 'Down payment cannot exceed the vehicle price';
  } else if (inputs.downPayment > maxDownPayment) {
    errors.downPayment = `Down payment cannot exceed ${EMI_LIMITS.DOWN_PAYMENT_MAX_PERCENT}% (₹${maxDownPayment.toLocaleString('en-IN')})`;
  }

  // Validate Interest Rate
  if (isNaN(inputs.interestRate) || inputs.interestRate < EMI_LIMITS.INTEREST_RATE_MIN) {
    errors.interestRate = `Interest rate must be at least ${EMI_LIMITS.INTEREST_RATE_MIN}%`;
  } else if (inputs.interestRate > EMI_LIMITS.INTEREST_RATE_MAX) {
    errors.interestRate = `Interest rate cannot exceed ${EMI_LIMITS.INTEREST_RATE_MAX}%`;
  }

  // Validate Tenure
  if (inputs.tenureUnit === 'years') {
    if (isNaN(inputs.tenureValue) || inputs.tenureValue < EMI_LIMITS.TENURE_YEARS_MIN) {
      errors.tenureValue = `Tenure must be at least ${EMI_LIMITS.TENURE_YEARS_MIN} year`;
    } else if (inputs.tenureValue > EMI_LIMITS.TENURE_YEARS_MAX) {
      errors.tenureValue = `Tenure cannot exceed ${EMI_LIMITS.TENURE_YEARS_MAX} years`;
    }
  } else {
    if (isNaN(inputs.tenureValue) || inputs.tenureValue < EMI_LIMITS.TENURE_MONTHS_MIN) {
      errors.tenureValue = `Tenure must be at least ${EMI_LIMITS.TENURE_MONTHS_MIN} months`;
    } else if (inputs.tenureValue > EMI_LIMITS.TENURE_MONTHS_MAX) {
      errors.tenureValue = `Tenure cannot exceed ${EMI_LIMITS.TENURE_MONTHS_MAX} months`;
    }
  }

  return errors;
};
