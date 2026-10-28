"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getProjects,
  getTasks,
  type Project,
  type Task,
} from "@/lib/api";

type DashboardData = {
  projects: Project[];
  tasks: Task[];
};

const initialData: DashboardData = {
  projects: [],
  tasks: [],
};

export default function Home() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const projects = await getProjects();
        const taskGroups = await Promise.all(
          projects.map((project) => getTasks(project.id)),
        );
        const tasks = taskGroups.flat();

        setData({ projects, tasks });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load the dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const completedTasks = data.tasks.filter(
    (task) => task.completed,
  ).length;

  const completionRate =
    data.tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / data.tasks.length) * 100,
        );

  const projectPreview = data.projects.slice(0, 3);
  const taskPreview = data.tasks.slice(0, 5);

  const stats = [
    {
      label: "Projects",
      value: data.projects.length,
      helper: "Workspaces in TaskFlow",
    },
    {
      label: "Total tasks",
      value: data.tasks.length,
      helper: "Tasks across all projects",
    },
    {
      label: "Completed",
      value: completedTasks,
      helper: "Tasks marked complete",
    },
    {
      label: "Progress",
      value: `${completionRate}%`,
      helper: "Overall completion rate",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Dashboard
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            Welcome to TaskFlow
          </h2>
          <p className="mt-3 text-slate-600">
            Track projects, tasks and overall progress.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/projects"
            className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white"
          >
            New project
          </Link>
          <Link
            href="/tasks"
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium"
          >
            Manage tasks
          </Link>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      ) : !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {stat.helper}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Project overview
                </h3>
                <Link
                  href="/projects"
                  className="text-sm font-medium text-indigo-600"
                >
                  View all
                </Link>
              </div>

              {projectPreview.length === 0 ? (
                <p className="mt-6 rounded-lg bg-slate-50 p-5 text-slate-600">
                  No projects yet. Create your first project.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {projectPreview.map((project) => (
                    <article
                      key={project.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {project.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {project.description ||
                            "No description provided."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Task snapshot
                </h3>
                <Link
                  href="/tasks"
                  className="text-sm font-medium text-indigo-600"
                >
                  View all
                </Link>
              </div>

              {taskPreview.length === 0 ? (
                <p className="mt-6 rounded-lg bg-slate-50 p-5 text-slate-600">
                  No tasks yet. Add a task to a project.
                </p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {taskPreview.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <span
                        className={
                          task.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }
                      >
                        {task.title}
                      </span>
                      <span
                        className={
                          task.completed
                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {task.completed ? "Completed" : "Open"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
