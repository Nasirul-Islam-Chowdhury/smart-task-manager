import mongoose, { Document, Schema } from 'mongoose';

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Status {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  assignedMember: mongoose.Types.ObjectId | null;
  priority: Priority;
  status: Status;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assignedMember: {
    type: Schema.Types.ObjectId,
    ref: 'Team.members',
    default: null
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    default: Priority.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.PENDING
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', taskSchema);
