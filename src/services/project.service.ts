import { Project, User } from '@prisma/client';
import {
  CreateProjectInput,
  DeleteProjectInput,
  UpdateProjectInput,
} from '../schema/project.schema';
import { db } from '../utils/db.server';

export const createProject = async (
  input: CreateProjectInput,
  userId: User['id']
) => {
  try {
    const { title, endsAt } = input;
    const newProject = await db.project.create({
      data: {
        title,
        endsAt: new Date(endsAt),
        creatorId: userId,
      },
    });
    return newProject;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const getAllProjects = async (userId: User['id']) => {
  try {
    const projects = await db.project.findMany({
      where: {
        creatorId: userId,
        completed: false,
      },
      include: {
        todos: {
          select: {
            id: true,
            description: true,
            endsAt: true,
            completed: true,
          },
        },
      },
    });
    return projects;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const deleteProject = async (input: DeleteProjectInput) => {
  try {
    const { projectId } = input;
    const deletedProject = await db.project.delete({
      where: {
        id: projectId,
      },
    });
    return deletedProject;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const updateProject = async (input: UpdateProjectInput) => {
  try {
    const { projectId, title, endsAt, completed } = input;
    const updatedProject = await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        title,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        completed,
      },
    });
    return updatedProject;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
