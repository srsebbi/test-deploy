import { NextFunction, Request, Response } from 'express';
import {
  CreateTodoInput,
  DeleteTodoInput,
  UpdateTodoInput,
} from '../schema/todo.schema';
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  updateTodo,
} from '../services/todo.service';
import logger from '../utils/logger';
import { User } from '@prisma/client';

export const createTodoHandler = async (
  req: Request<{}, {}, CreateTodoInput>,
  res: Response
) => {
  try {
    const currentUser: Omit<User, 'password'> = res.locals.user;
    const todo = await createTodo(req.body, currentUser.id);
    return res.send(todo);
  } catch (e: any) {
    return res.status(400).send({ error: 'Unauthorized' });
  }
};

export const getAllTodosHandler = async (req: Request, res: Response) => {
  try {
    const currentUser: Omit<User, 'password'> = res.locals.user;
    if (currentUser) {
      const todos = await getAllTodos(currentUser.id);
      return res.send(todos);
    }
  } catch (e: any) {
    logger.error(e);
    return res.status(400).send(null);
  }
};

// Update

export const updateTodoHandler = async (
  req: Request<{}, {}, UpdateTodoInput>,
  res: Response
) => {
  try {
    const { todoId, completed, description, endsAt, projectId } = req.body;
    const updatedTodo = await updateTodo({
      todoId,
      description,
      endsAt,
      completed,
      projectId,
    });
    return res.status(200).send(updatedTodo);
  } catch (e: any) {
    return res.status(400).send({ error: 'Unauthorized' });
  }
};

// Delete

export const deleteTodoHandler = async (
  req: Request<{}, {}, DeleteTodoInput>,
  res: Response
) => {
  try {
    const { todoId } = req.body;
    const deletedTodo = await deleteTodo(todoId);
    if (deletedTodo) return res.status(200).send(deletedTodo);
  } catch (e: any) {
    console.log('Todo Not found');
    return res.status(404).send({ error: 'Todo not found or already deleted' });
  }
};
