import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project';
import Team from '../models/Team';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all projects for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ owner: req.userId }).populate('team');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single project by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.userId }).populate('team');

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new project
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('team').notEmpty().withMessage('Team is required'),
    body('description').optional().isString()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, team } = req.body;

      // Verify team exists and belongs to user
      const teamExists = await Team.findOne({ _id: team, owner: req.userId });
      if (!teamExists) {
        res.status(400).json({ error: 'Invalid team' });
        return;
      }

      const project = new Project({
        name,
        description,
        team,
        owner: req.userId
      });

      await project.save();
      await project.populate('team');
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update a project
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().isString(),
    body('team').optional().notEmpty().withMessage('Team cannot be empty')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const project = await Project.findOne({ _id: req.params.id, owner: req.userId });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const { name, description, team } = req.body;

      if (team !== undefined) {
        const teamExists = await Team.findOne({ _id: team, owner: req.userId });
        if (!teamExists) {
          res.status(400).json({ error: 'Invalid team' });
          return;
        }
        project.team = team;
      }

      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;

      await project.save();
      await project.populate('team');
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a project
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
