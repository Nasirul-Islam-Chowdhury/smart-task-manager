import express, { Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get recent activity logs for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const logs = await ActivityLog.find({ owner: req.userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('task');

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity logs for a specific project
router.get('/project/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const logs = await ActivityLog.find({ owner: req.userId })
      .populate({
        path: 'task',
        match: { project: req.params.projectId }
      })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Filter out logs where task is null (doesn't match project)
    const filteredLogs = logs.filter(log => log.task !== null);

    res.json(filteredLogs);
  } catch (error) {
    console.error('Error fetching project activity logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
