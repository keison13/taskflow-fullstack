"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  createProject,
  getProjects,
  type Project,
} from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setError("");
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load projects",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      const project = await createProject({
        name: cleanName,
        description: cleanDescription,
      });

      setProjects((currentProjects) => [
        project,
        ...currentProjects,
      ]);
      setName("");
      setDescription("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create project",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">
          Projects
        </p>
        <h2 className="mt-1 text-3xl font-bold">
          Organize your work
        </h2>
        <p className="mt-3 text-slate-600">
          Create a project, then add its tasks from the Tasks page.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-red-700"
        >
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold">
            Create a project
          </h3>

          <label className="mt-5 block text-sm font-medium">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Website redesign"
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3"
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            Description
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What should this project accomplish?"
              rows={4}
              className="mt-2 block w-full resize-none rounded-lg border border-slate-300 p-3"
            />
          </label>

          <button
            disabled={submitting || !name.trim()}
            className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create project"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Your projects
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {projects.length}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-600">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="mt-6 rounded-lg bg-slate-50 p-5 text-slate-600">
              No projects yet. Create your first project.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700">
                    {project.name.charAt(0).toUpperCase()}
                  </div>

                  <h4 className="mt-4 text-lg font-semibold">
                    {project.name}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    {project.description ||
                      "No description provided."}
                  </p>
                  <p className="mt-4 text-xs text-slate-400">
                    Project #{project.id}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
