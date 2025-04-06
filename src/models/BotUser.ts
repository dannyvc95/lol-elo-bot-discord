import mongoose, {Schema, Model} from 'mongoose';

export interface BotUser {
  userId: string;
  displayName: string;
  honor: {
    honorBudgetCount: number;
    honorReceived: {
      userId: string;
      date: Date;
    }[];
    lastFreeHonorDate: Date;
  }
}

const botUserSchema = new Schema<BotUser>({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    honor: {
        honorBudgetCount: {
            type: Number,
            required: true,
        },
        honorReceived: [{
            userId: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            }
        }],
        lastFreeHonorDate: {
            type: Date,
            required: true,
        }
    }
});

export const BotUserModel: Model<BotUser> = mongoose.model<BotUser>('BotUser', botUserSchema);
