import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
  capacity: number;
}

export interface ITeam extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Member role is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Member capacity is required'],
    min: 0,
    max: 5,
    default: 3
  }
}, { _id: true });

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [teamMemberSchema]
}, {
  timestamps: true
});

export default mongoose.model<ITeam>('Team', teamSchema);
