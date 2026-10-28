export type User = {
  id: number;
  name: string | null;
  email: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description: string;
};

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  projectId: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  data: T;
};

type ErrorResponse = {
  message?: string;
  error?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  // Se estiver no navegador, tenta resgatar o token JWT do localStorage e injetar na requisição
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as
      | ErrorResponse
      | null;

    throw new Error(error?.message ?? error?.error ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ==========================================
// ROTAS DE AUTENTICAÇÃO (Auth)
// ==========================================

export async function registerUser(input: { name?: string; email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (response.token && typeof window !== "undefined") {
    localStorage.setItem("token", response.token);
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    // Notifica imediatamente qualquer componente ouvindo (como a Sidebar)
    window.dispatchEvent(new Event("auth-change"));
  }

  return response;
}

export async function loginUser(input: { email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (response.token && typeof window !== "undefined") {
    localStorage.setItem("token", response.token);
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    // Notifica imediatamente qualquer componente ouvindo (como a Sidebar)
    window.dispatchEvent(new Event("auth-change"));
  }

  return response;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
  }
}

// ==========================================
// ROTAS DE PROJETOS E TAREFAS (Protegidas)
// ==========================================

export async function getProjects() {
  const response = await apiRequest<ApiResponse<Project[]>>(
    "/api/projects",
  );

  return response.data;
}

export async function createProject(input: CreateProjectInput) {
  const response = await apiRequest<ApiResponse<Project>>(
    "/api/projects",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function deleteProject(projectId: number) {
  return apiRequest<void>(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function getTasks(projectId: number) {
  const response = await apiRequest<ApiResponse<Task[]>>(
    `/api/projects/${projectId}/tasks`,
  );

  return response.data;
}

export async function createTask(projectId: number, title: string) {
  const response = await apiRequest<ApiResponse<Task>>(
    `/api/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify({ title }),
    },
  );

  return response.data;
}

export async function updateTaskCompletion(
  taskId: number,
  completed: boolean,
) {
  const response = await apiRequest<ApiResponse<Task>>(
    `/api/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    },
  );

  return response.data;
}

export function deleteTask(taskId: number) {
  return apiRequest<void>(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
}