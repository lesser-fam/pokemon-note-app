type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
};

type ValidateEffortValuesResult =
    | {
          isValid: true;
      }
    | {
          isValid: false;
          reason: "single_limit" | "total_limit";
      };

export const validateEffortValues = (
    values: number[],
    limits: EffortValueLimits,
): ValidateEffortValuesResult => {
    const hasOverSingleLimit = values.some(
        (value) => value > limits.singleLimit,
    );

    if (hasOverSingleLimit) {
        return {
            isValid: false,
            reason: "single_limit",
        };
    }

    const total = values.reduce(
        (currentTotal, value) => currentTotal + value,
        0,
    );

    if (total > limits.totalLimit) {
        return {
            isValid: false,
            reason: "total_limit",
        };
    }

    return {
        isValid: true,
    };
};
