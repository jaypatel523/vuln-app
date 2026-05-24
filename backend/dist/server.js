"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const tasks_1 = __importDefault(require("./routes/tasks"));
const analytics_1 = __importDefault(require("./routes/analytics"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/tasks', tasks_1.default);
app.use('/api/analytics', analytics_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Auto-seed function to ensure the user sees interactive content out-of-the-box
async function seedDatabase() {
    try {
        const taskCount = await db_1.prisma.task.count();
        if (taskCount === 0) {
            console.log('Seeding initial tasks into database...');
            const now = new Date();
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(now.getDate() - 2);
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            const threeDaysAhead = new Date();
            threeDaysAhead.setDate(now.getDate() + 3);
            const fiveDaysAhead = new Date();
            fiveDaysAhead.setDate(now.getDate() + 5);
            await db_1.prisma.task.createMany({
                data: [
                    {
                        title: 'Design ZenFlow landing page UI',
                        description: 'Create high-fidelity mockups for glassmorphic elements and dark mode theme',
                        status: 'DONE',
                        priority: 'HIGH',
                        dueDate: twoDaysAgo,
                    },
                    {
                        title: 'Integrate Recharts component',
                        description: 'Implement responsive analytics charts showing task progress and priority metrics',
                        status: 'IN_PROGRESS',
                        priority: 'MEDIUM',
                        dueDate: tomorrow,
                    },
                    {
                        title: 'Optimize API query response',
                        description: 'Add indexes to SQLite database and implement express route pagination',
                        status: 'REVIEW',
                        priority: 'HIGH',
                        dueDate: now,
                    },
                    {
                        title: 'Write automated API validation tests',
                        description: 'Validate POST /api/tasks payloads with invalid priority and status cases',
                        status: 'TODO',
                        priority: 'LOW',
                        dueDate: fiveDaysAhead,
                    },
                    {
                        title: 'Draft user onboarding documentation',
                        description: 'Document standard Kanban swimlane definitions and task priority lifecycle',
                        status: 'TODO',
                        priority: 'LOW',
                        dueDate: threeDaysAhead,
                    }
                ]
            });
            await db_1.prisma.activityLog.createMany({
                data: [
                    { action: 'SEED', details: 'Pre-populated task database with sample workspace tasks' },
                    { action: 'SYSTEM', details: 'Initialized workspace schema' }
                ]
            });
            console.log('Seeding complete!');
        }
    }
    catch (error) {
        console.error('Failed to auto-seed database:', error);
    }
}
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedDatabase();
});
