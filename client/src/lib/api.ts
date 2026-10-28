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
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as
      | ErrorResponse
      | null;

    throw new Error(error?.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

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
