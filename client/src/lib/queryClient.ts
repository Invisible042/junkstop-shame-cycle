import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export { queryClient };

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiRequest = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const uploadFile = async (url: string, formData: FormData) => {
  const token = localStorage.getItem("auth_token");
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};