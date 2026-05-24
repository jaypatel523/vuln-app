import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/analytics/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalTasks = await prisma.task.count();
    
    // Status counts
    const todoCount = await prisma.task.count({ where: { status: 'TODO' } });
    const inProgressCount = await prisma.task.count({ where: { status: 'IN_PROGRESS' } });
    const reviewCount = await prisma.task.count({ where: { status: 'REVIEW' } });
    const doneCount = await prisma.task.count({ where: { status: 'DONE' } });

    // Priority counts
    const lowCount = await prisma.task.count({ where: { priority: 'LOW' } });
    const mediumCount = await prisma.task.count({ where: { priority: 'MEDIUM' } });
    const highCount = await prisma.task.count({ where: { priority: 'HIGH' } });

    // Overdue tasks
    const now = new Date();
    const overdueCount = await prisma.task.count({
      where: {
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
    });

    res.json({
      summary: {
        total: totalTasks,
        overdue: overdueCount,
      },
      status: {
        TODO: todoCount,
        IN_PROGRESS: inProgressCount,
        REVIEW: reviewCount,
        DONE: doneCount,
      },
      priority: {
        LOW: lowCount,
        MEDIUM: mediumCount,
        HIGH: highCount,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

// GET /api/analytics/activity
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

export default router;
