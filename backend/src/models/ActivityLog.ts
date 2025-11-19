import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  task: mongoose.Types.ObjectId;
  taskTitle: string;
  fromMember: string;
  toMember: string;
  owner: mongoose.Types.ObjectId;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  taskTitle: {
    type: String,
    required: true
  },
  fromMember: {
    type: String,
    required: true
  },
  toMember: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
