import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Task, { Priority, Status, ITask } from '../models/Task';
import Project from '../models/Project';
import Team from '../models/Team';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, member, status } = req.query;

    const query: any = { owner: req.userId };

    if (project) query.project = project;
    if (status) query.status = status;
    if (member) {
      if (member === 'unassigned') {
        query.assignedMember = null;
      } else {
        query.assignedMember = member;
      }
    }

    const tasks = await Task.find(query)
      .populate('project')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single task by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.userId })
      .populate('project');

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get member workload for a project
router.get('/workload/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId }).populate('team');

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const team = await Team.findById(project.team);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const tasks = await Task.find({
      project: req.params.projectId,
      owner: req.userId,
      status: { $ne: Status.DONE }
    });

    const workload = team.members.map(member => {
      const memberTasks = tasks.filter(task =>
        task.assignedMember?.toString() === member._id.toString()
      );

      return {
        memberId: member._id,
        name: member.name,
        role: member.role,
        capacity: member.capacity,
        currentTasks: memberTasks.length,
        isOverloaded: memberTasks.length > member.capacity
      };
    });

    res.json(workload);
  } catch (error) {
    console.error('Error fetching workload:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().isString(),
    body('project').notEmpty().withMessage('Project is required'),
    body('assignedMember').optional(),
    body('priority').optional().isIn(Object.values(Priority)).withMessage('Invalid priority'),
    body('status').optional().isIn(Object.values(Status)).withMessage('Invalid status')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { title, description, project, assignedMember, priority, status } = req.body;

      // Verify project exists and belongs to user
      const projectExists = await Project.findOne({ _id: project, owner: req.userId });
      if (!projectExists) {
        res.status(400).json({ error: 'Invalid project' });
        return;
      }

      const task = new Task({
        title,
        description,
        project,
        assignedMember: assignedMember || null,
        priority: priority || Priority.MEDIUM,
        status: status || Status.PENDING,
        owner: req.userId
      });

      await task.save();
      await task.populate('project');
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update a task
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
    body('description').optional().isString(),
    body('assignedMember').optional(),
    body('priority').optional().isIn(Object.values(Priority)).withMessage('Invalid priority'),
    body('status').optional().isIn(Object.values(Status)).withMessage('Invalid status')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const task = await Task.findOne({ _id: req.params.id, owner: req.userId });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const { title, description, assignedMember, priority, status } = req.body;

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedMember !== undefined) task.assignedMember = assignedMember || null;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;

      await task.save();
      await task.populate('project');
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a task
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-assign task to member with least load
router.post('/auto-assign/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.body;

    const task = await Task.findOne({ _id: taskId, owner: req.userId });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId }).populate('team');
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const team = await Team.findById(project.team);
    if (!team || team.members.length === 0) {
      res.status(400).json({ error: 'No team members available' });
      return;
    }

    const tasks = await Task.find({
      project: req.params.projectId,
      owner: req.userId,
      status: { $ne: Status.DONE }
    });

    // Find member with least load
    let minLoad = Infinity;
    let selectedMember = null;

    for (const member of team.members) {
      const memberTasks = tasks.filter(t =>
        t.assignedMember?.toString() === member._id.toString()
      ).length;

      const load = memberTasks / member.capacity;

      if (load < minLoad) {
        minLoad = load;
        selectedMember = member;
      }
    }

    if (selectedMember) {
      task.assignedMember = selectedMember._id;
      await task.save();
      await task.populate('project');
      res.json(task);
    } else {
      res.status(400).json({ error: 'Could not auto-assign task' });
    }
  } catch (error) {
    console.error('Error auto-assigning task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reassign tasks (smart reassignment)
router.post('/reassign/:projectId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId }).populate('team');

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const team = await Team.findById(project.team);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const tasks = await Task.find({
      project: req.params.projectId,
      owner: req.userId,
      status: { $ne: Status.DONE }
    });

    const reassignments: any[] = [];

    // Calculate current workload
    const memberWorkload = new Map();
    team.members.forEach(member => {
      memberWorkload.set(member._id.toString(), {
        member,
        tasks: [],
        capacity: member.capacity
      });
    });

    tasks.forEach(task => {
      if (task.assignedMember) {
        const memberId = task.assignedMember.toString();
        const workload = memberWorkload.get(memberId);
        if (workload) {
          workload.tasks.push(task);
        }
      }
    });

    // Find overloaded members and reassign low/medium priority tasks
    for (const [memberId, workload] of memberWorkload.entries()) {
      if (workload.tasks.length > workload.capacity) {
        const excessCount = workload.tasks.length - workload.capacity;

        // Sort tasks: keep high priority, move low/medium priority
        const tasksToMove = workload.tasks
          .filter((task: ITask) => task.priority !== Priority.HIGH)
          .slice(0, excessCount);

        for (const task of tasksToMove) {
          // Find member with free capacity
          let targetMember = null;
          let minLoad = Infinity;

          for (const [targetId, targetWorkload] of memberWorkload.entries()) {
            if (targetId !== memberId && targetWorkload.tasks.length < targetWorkload.capacity) {
              const load = targetWorkload.tasks.length / targetWorkload.capacity;
              if (load < minLoad) {
                minLoad = load;
                targetMember = targetWorkload;
              }
            }
          }

          if (targetMember) {
            const oldMemberName = workload.member.name;
            const newMemberName = targetMember.member.name;

            // Update task
            task.assignedMember = targetMember.member._id;
            await task.save();

            // Log activity
            const log = new ActivityLog({
              task: task._id,
              taskTitle: task.title,
              fromMember: oldMemberName,
              toMember: newMemberName,
              owner: req.userId
            });
            await log.save();

            // Update workload tracking
            workload.tasks = workload.tasks.filter((t: ITask) => t._id.toString() !== task._id.toString());
            targetMember.tasks.push(task);

            reassignments.push({
              taskId: task._id,
              taskTitle: task.title,
              from: oldMemberName,
              to: newMemberName
            });
          }
        }
      }
    }

    res.json({
      message: `${reassignments.length} task(s) reassigned successfully`,
      reassignments
    });
  } catch (error) {
    console.error('Error reassigning tasks:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
