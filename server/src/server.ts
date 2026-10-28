import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./lib/prisma.ts";


type Project = {
  id: number;
  name: string;
  description: string;
};

let projects: Project[] = [
  {
    id: 1,
    name: "Course Platform",
    description: "Build the TaskFlow course project",
  },
  {
    id: 2,
    name: "Marketing Website",
    description: "Create the public product website",
  },
];

let nextProjectId = 3;

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}


const app = express();
const port = Number(process.env.PORT) || 5000;

const requestLogger: RequestHandler = (request, _response, next) => {
  console.log(`${request.method} ${request.path}`);
  next();
};

app.use(requestLogger);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ message: "TaskFlow API is running" });
});

const getProjects: RequestHandler = async (request, response) => {
  const search =
    typeof request.query.search === "string"
      ? request.query.search.trim()
      : "";

  const projects = await prisma.project.findMany({
    where: search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json({ data: projects });
};


const getProjectById: RequestHandler = async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  response.json({ data: project });
};


const createProject: RequestHandler = async (request, response) => {
  const body = request.body as
    | { name?: unknown; description?: unknown }
    | undefined;

  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    response.status(400).json({ message: "Project name is required" });
    return;
  }

   const project = await prisma.project.create({
    data: {
      name: body.name.trim(),
      description:
        typeof body.description === "string"
          ? body.description.trim()
          : "",
    },
  });

  response.status(201).json({ data: project });

};

const getTasks: RequestHandler = async (request, response) => {
  const projectId = Number(request.params.projectId);

  if (!Number.isInteger(projectId)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  response.json({ data: project.tasks });
};

const createTask: RequestHandler = async (request, response) => {
  const projectId = Number(request.params.projectId);
  const body = request.body as { title?: unknown } | undefined;

  if (!Number.isInteger(projectId)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    response.status(400).json({ message: "Task title is required" });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const task = await prisma.task.create({
    data: {
      title: body.title.trim(),
      projectId,
    },
  });

  response.status(201).json({ data: task });
};

const updateTaskCompletion: RequestHandler = async (request, response) => {
  const id = Number(request.params.id);
  const body = request.body as { completed?: unknown } | undefined;

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  if (!body || typeof body.completed !== "boolean") {
    response.status(400).json({ message: "Completed must be a boolean" });
    return;
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingTask) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      completed: body.completed,
    },
  });

  response.json({ data: task });
};

const deleteTask: RequestHandler = async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const result = await prisma.task.deleteMany({
    where: { id },
  });

  if (result.count === 0) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  response.status(204).send();
};

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});


app.get("/api/projects", getProjects);
app.get("/api/projects/:id", getProjectById);
app.post("/api/projects", createProject);

app.get("/api/projects/:projectId/tasks", getTasks);
app.post("/api/projects/:projectId/tasks", createTask);
app.patch("/api/tasks/:id", updateTaskCompletion);
app.delete("/api/tasks/:id", deleteTask);


app.use((request, response) => {
  response.status(404).json({
    message: `Route ${request.method} ${request.path} not found`,
  });
});

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong" });
};

app.use(errorHandler);


app.listen(port, "0.0.0.0", () => {
  console.log(`API running on port ${port}`);
});

