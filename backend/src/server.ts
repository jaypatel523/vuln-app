import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';
import taskRoutes from './routes/tasks';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Auto-seed function to ensure the user sees interactive content out-of-the-box
async function seedDatabase() {
  try {
    const taskCount = await prisma.task.count();
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

      await prisma.task.createMany({
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

      await prisma.activityLog.createMany({
        data: [
          { action: 'SEED', details: 'Pre-populated task database with sample workspace tasks' },
          { action: 'SYSTEM', details: 'Initialized workspace schema' }
        ]
      });

      console.log('Seeding complete!');
    }
  } catch (error) {
    console.error('Failed to auto-seed database:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedDatabase();
});
