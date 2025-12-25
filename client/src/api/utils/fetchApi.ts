import type { ErrorResponse } from "@shared/types/errorResponse.types";

export const fetchApi = async <T>(
  method: string,
  url: string,
  options?: RequestInit
): Promise<T> => {
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(url, {
    method: method,
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data: T = await response.json();
  return data;
};
