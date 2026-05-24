import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { z } from 'zod';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
});

// GET /api/tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createTaskSchema.parse(req.body);
    const parsedDueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description || null,
        status: parsed.status,
        priority: parsed.priority,
        dueDate: parsedDueDate,
      },
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        action: 'CREATE_TASK',
        details: `Created task "${task.title}"`,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
       return;
    }
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const parsed = updateTaskSchema.parse(req.body);
    const updateData: any = { ...parsed };
    if (parsed.dueDate !== undefined) {
      updateData.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
    }

    const originalTask = await prisma.task.findUnique({ where: { id } });
    if (!originalTask) {
       res.status(404).json({ error: 'Task not found' });
       return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Log action
    let actionDetails = `Updated task "${task.title}"`;
    if (parsed.status && parsed.status !== originalTask.status) {
      actionDetails = `Moved "${task.title}" to ${parsed.status}`;
    }
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE_TASK',
        details: actionDetails,
      },
    });

    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ errors: error.errors });
       return;
    }
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
       res.status(404).json({ error: 'Task not found' });
       return;
    }

    await prisma.task.delete({ where: { id } });

    // Log action
    await prisma.activityLog.create({
      data: {
        action: 'DELETE_TASK',
        details: `Deleted task "${task.title}"`,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
