import mongoose from 'mongoose';
import {BotUser, BotUserModel} from '../models/BotUser';

const databaseConfig = {
    uri: process.env.MONGODB_CONNECTION_URI,
    dbName: 'lol-elo-bot',
};

export async function connectDatabase() {
    try {
        if (databaseConfig.uri) {
            await mongoose.connect(databaseConfig.uri, {dbName: databaseConfig.dbName});
            console.log('Connected to MongoDB with Mongoose!');
        }
    } catch (error) {
        console.error(error);
    }
}

export const createBotUser = async (botUser: BotUser) => {
    try {
        return await new BotUserModel(botUser).save();
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const getBotUserByUserId = async (userId: string) => {
    try {
        if (userId) {
            return await BotUserModel.findOne({userId});
        }
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const honorUser = async (userId: string, count: number) => {
    try {
        if (count > 0 && count <= 1000) {
            const user = await BotUserModel.findOne({userId});
            if (user) {
                user.set({'honor.honorBudgetCount': Number(user.get('honor.honorBudgetCount')) + count});
                await user.save();
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export const giveHonor = async (
    userToGiveUserId: string, giveCount: number, userToReceiveUserId: string, receiveCount: number, free: boolean) => {
    try {
        console.log(receiveCount);
        const updatedUser = await BotUserModel.findOneAndUpdate(
            {userId: userToReceiveUserId},
            {$push: {'honor.honorReceived': {userId: userToGiveUserId, date: new Date()}}},
            {new: true},
        );

        if (updatedUser) {
            console.log('Updated User:', updatedUser);
        } else {
            console.log('User not found');
        }

        if (!free) {
            const uu = await BotUserModel.findOneAndUpdate(
                {userId: userToGiveUserId},
                {$set: {'honor.honorBudgetCount': giveCount - 1}},
                {new: true},
            );

            if (uu) {
                console.log('Updated User:', uu);
            } else {
                console.log('User not found');
            }
        } else {
            const uu = await BotUserModel.findOneAndUpdate(
                {userId: userToGiveUserId},
                {$set: {'honor.lastFreeHonorDate': new Date()}},
                {new: true},
            );

            if (uu) {
                console.log('Updated User:', uu);
            } else {
                console.log('User not found');
            }
        }

    } catch (error) {
        console.error('Error updating honor count:', error);
    }
};
