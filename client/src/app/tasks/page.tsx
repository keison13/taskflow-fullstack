"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  getProjects,
  getTasks,
  type Project,
  type Task,
  updateTaskCompletion,
} from "@/lib/api";

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setError("");
        const data = await getProjects();
        setProjects(data);
        setSelectedProjectId(data[0]?.id ?? null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load projects",
        );
      } finally {
        setLoadingProjects(false);
      }
    }

    void loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId === null) {
      setTasks([]);
      return;
    }

    const projectId = selectedProjectId;

    async function loadTasks() {
      try {
        setError("");
        setLoadingTasks(true);
        const data = await getTasks(projectId);
        setTasks(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not load tasks",
        );
      } finally {
        setLoadingTasks(false);
      }
    }

    void loadTasks();
  }, [selectedProjectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (selectedProjectId === null || !cleanTitle) {
      return;
    }

    try {
      setError("");
      const task = await createTask(selectedProjectId, cleanTitle);
      setTasks((currentTasks) => [...currentTasks, task]);
      setTitle("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not create task",
      );
    }
  }

  async function handleToggle(task: Task) {
    try {
      setError("");
      const updatedTask = await updateTaskCompletion(
        task.id,
        !task.completed,
      );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id
            ? updatedTask
            : currentTask,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update task",
      );
    }
  }

  async function handleDelete(taskId: number) {
    try {
      setError("");
      await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not delete task",
      );
    }
  }

  if (loadingProjects) {
    return <p>Loading projects...</p>;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium text-indigo-600">Tasks</p>
      <h2 className="mt-1 text-3xl font-bold">Manage your tasks</h2>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-red-700"
        >
          {error}
        </p>
      )}

      {projects.length === 0 ? (
        <p className="mt-6 text-slate-600">
          Create a project with Postman, then refresh this page.
        </p>
      ) : (
        <>
          <label className="mt-6 block text-sm font-medium">
            Project
            <select
              value={selectedProjectId ?? ""}
              onChange={(event) =>
                setSelectedProjectId(Number(event.target.value))
              }
              className="mt-2 block w-full rounded-lg border p-3"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a task"
              className="flex-1 rounded-lg border p-3"
            />
            <button
              disabled={!title.trim()}
              className="rounded-lg bg-indigo-600 px-5 text-white disabled:opacity-50"
            >
              Add
            </button>
          </form>

          {loadingTasks ? (
            <p className="mt-6">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="mt-6 text-slate-600">No tasks yet.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => void handleToggle(task)}
                    />
                    <span
                      className={
                        task.completed
                          ? "text-slate-400 line-through"
                          : ""
                      }
                    >
                      {task.title}
                    </span>
                  </label>

                  <button
                    onClick={() => void handleDelete(task.id)}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
