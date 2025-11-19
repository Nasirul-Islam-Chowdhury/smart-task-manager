import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Team from '../models/Team';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all teams for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({ owner: req.userId });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single team by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findOne({ _id: req.params.id, owner: req.userId });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new team
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Team name is required'),
    body('members').isArray().withMessage('Members must be an array')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, members } = req.body;

      const team = new Team({
        name,
        owner: req.userId,
        members: members || []
      });

      await team.save();
      res.status(201).json(team);
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update a team
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
    body('members').optional().isArray().withMessage('Members must be an array')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const team = await Team.findOne({ _id: req.params.id, owner: req.userId });

      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }

      const { name, members } = req.body;

      if (name !== undefined) team.name = name;
      if (members !== undefined) team.members = members;

      await team.save();
      res.json(team);
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a team
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findOneAndDelete({ _id: req.params.id, owner: req.userId });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
