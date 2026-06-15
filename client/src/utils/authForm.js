// Shared className helper for auth form inputs (adds error-state styling).
export const inputClassName = (hasError) =>
  `auth-form-input${hasError ? " is-error" : ""}`;
