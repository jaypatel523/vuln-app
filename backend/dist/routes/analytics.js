"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/analytics/stats
router.get('/stats', async (req, res) => {
    try {
        const totalTasks = await db_1.prisma.task.count();
        // Status counts
        const todoCount = await db_1.prisma.task.count({ where: { status: 'TODO' } });
        const inProgressCount = await db_1.prisma.task.count({ where: { status: 'IN_PROGRESS' } });
        const reviewCount = await db_1.prisma.task.count({ where: { status: 'REVIEW' } });
        const doneCount = await db_1.prisma.task.count({ where: { status: 'DONE' } });
        // Priority counts
        const lowCount = await db_1.prisma.task.count({ where: { priority: 'LOW' } });
        const mediumCount = await db_1.prisma.task.count({ where: { priority: 'MEDIUM' } });
        const highCount = await db_1.prisma.task.count({ where: { priority: 'HIGH' } });
        // Overdue tasks
        const now = new Date();
        const overdueCount = await db_1.prisma.task.count({
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
    }
    catch (error) {
        console.error('Error fetching analytics stats:', error);
        res.status(500).json({ error: 'Failed to fetch analytics stats' });
    }
});
// GET /api/analytics/activity
router.get('/activity', async (req, res) => {
    try {
        const logs = await db_1.prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 15,
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});
exports.default = router;
