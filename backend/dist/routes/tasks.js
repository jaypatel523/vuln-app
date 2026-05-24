"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    dueDate: zod_1.z.string().datetime().optional().nullable().or(zod_1.z.string().optional().nullable()),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable().or(zod_1.z.string().optional().nullable()),
});
// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await db_1.prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const parsed = createTaskSchema.parse(req.body);
        const parsedDueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
        const task = await db_1.prisma.task.create({
            data: {
                title: parsed.title,
                description: parsed.description || null,
                status: parsed.status,
                priority: parsed.priority,
                dueDate: parsedDueDate,
            },
        });
        // Log action
        await db_1.prisma.activityLog.create({
            data: {
                action: 'CREATE_TASK',
                details: `Created task "${task.title}"`,
            },
        });
        res.status(201).json(task);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const parsed = updateTaskSchema.parse(req.body);
        const updateData = { ...parsed };
        if (parsed.dueDate !== undefined) {
            updateData.dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
        }
        const originalTask = await db_1.prisma.task.findUnique({ where: { id } });
        if (!originalTask) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const task = await db_1.prisma.task.update({
            where: { id },
            data: updateData,
        });
        // Log action
        let actionDetails = `Updated task "${task.title}"`;
        if (parsed.status && parsed.status !== originalTask.status) {
            actionDetails = `Moved "${task.title}" to ${parsed.status}`;
        }
        await db_1.prisma.activityLog.create({
            data: {
                action: 'UPDATE_TASK',
                details: actionDetails,
            },
        });
        res.json(task);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
            return;
        }
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const task = await db_1.prisma.task.findUnique({ where: { id } });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        await db_1.prisma.task.delete({ where: { id } });
        // Log action
        await db_1.prisma.activityLog.create({
            data: {
                action: 'DELETE_TASK',
                details: `Deleted task "${task.title}"`,
            },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
exports.default = router;
