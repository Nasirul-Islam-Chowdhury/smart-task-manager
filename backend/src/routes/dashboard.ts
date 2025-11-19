import express, { Response } from 'express';
import Project from '../models/Project';
import Task, { Status } from '../models/Task';
import Team from '../models/Team';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalProjects = await Project.countDocuments({ owner: req.userId });
    const totalTasks = await Task.countDocuments({ owner: req.userId });

    const teams = await Team.find({ owner: req.userId });

    const tasks = await Task.find({
      owner: req.userId,
      status: { $ne: Status.DONE }
    });

    // Calculate team summary
    const teamSummary = [];

    for (const team of teams) {
      for (const member of team.members) {
        const memberTasks = tasks.filter(task =>
          task.assignedMember?.toString() === member._id.toString()
        ).length;

        teamSummary.push({
          teamId: team._id,
          teamName: team.name,
          memberId: member._id,
          memberName: member.name,
          role: member.role,
          capacity: member.capacity,
          currentTasks: memberTasks,
          isOverloaded: memberTasks > member.capacity
        });
      }
    }

    const recentLogs = await ActivityLog.find({ owner: req.userId })
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      totalProjects,
      totalTasks,
      teamSummary,
      recentReassignments: recentLogs
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
