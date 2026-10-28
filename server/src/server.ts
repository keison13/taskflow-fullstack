import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware, type AuthRequest } from "./middlewares/authMiddleware.js";

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

// Rotas de Autenticação (Públicas)
app.use("/api/auth", authRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ message: "TaskFlow API is running" });
});

// ==========================================
// ROTAS DE PROJETOS (Protegidas por Auth)
// ==========================================

const getProjects: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
  const search =
    typeof request.query.search === "string"
      ? request.query.search.trim()
      : "";

  const projects = await prisma.project.findMany({
    where: {
      userId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json({ data: projects });
};

const getProjectById: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  response.json({ data: project });
};

const createProject: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
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
      userId: userId!,
    },
  });

  response.status(201).json({ data: project });
};

const deleteProject: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  await prisma.project.delete({
    where: { id },
  });

  response.status(204).send();
};

// ==========================================
// ROTAS DE TAREFAS (Tasks - Protegidas)
// ==========================================

const getTasks: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
  const projectId = Number(request.params.projectId);

  if (!Number.isInteger(projectId)) {
    response.status(404).json({ message: "Project not found" });
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
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

const createTask: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
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

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
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

const updateTaskCompletion: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
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
    include: { project: true },
  });

  if (!existingTask || existingTask.project.userId !== userId) {
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

const deleteTask: RequestHandler = async (req, response) => {
  const request = req as AuthRequest;
  const userId = request.userId;
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!existingTask || existingTask.project.userId !== userId) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  await prisma.task.delete({
    where: { id },
  });

  response.status(204).send();
};

// ==========================================
// REGISTRO DAS ROTAS COM O AUTH MIDDLEWARE
// ==========================================

app.get("/api/projects", authMiddleware, getProjects);
app.get("/api/projects/:id", authMiddleware, getProjectById);
app.post("/api/projects", authMiddleware, createProject);
app.delete("/api/projects/:id", authMiddleware, deleteProject);

app.get("/api/projects/:projectId/tasks", authMiddleware, getTasks);
app.post("/api/projects/:projectId/tasks", authMiddleware, createTask);
app.patch("/api/tasks/:id", authMiddleware, updateTaskCompletion);
app.delete("/api/tasks/:id", authMiddleware, deleteTask);

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