import {Tier} from '../types/LeagueEntryDTO';
import roles from '../configs/roles.json';
import {ColorResolvable} from 'discord.js';

export const calculateWinRate = (wins: number, losses: number): number => {
    if (wins >= 0 && losses >= 0) {
        return Math.ceil((wins / (wins + losses)) * 100);
    }
    return 0;
};

export const getTierImageSource = (tier: Tier): string => {
    return `${process.env.ASSETS_IMAGE_SOURCE}/${tier.toLowerCase()}.png`;
};

export const getTierColor = (tier: Tier): ColorResolvable | null => {
    if (tier in roles) {
        return roles[tier].color as ColorResolvable;
    }
    return null;
};

export const yesNo = (value: boolean): string => {
    return value ? ':white_check_mark: Yes' : ':x: No';
};

export const getRandomInteger = (length: number): number => {
    const random = Math.floor(Math.random() * length);
    return random < length ? random : 0;
};

export const getNextFreeHonorPendingHours = (lastFreeHonorDate: Date): number  => {
    const now = new Date();
    const diffInHours = (now.getTime() - lastFreeHonorDate.getTime()) / (1000 * 60 * 60);
    return diffInHours >= 24 ? 0 : Math.ceil(24 - diffInHours);
};

export const getHonorLevel = (honorReceivedCount: number) => {
    const level = {
        zero: {min: 0, max: 1},
        one: {min: 1, max: 3},
        two: {min: 3, max: 5},
        three: {min: 5, max: 10},
        four: {min: 10, max: 20},
        five: {min: 30, max: 30},
    };

    if (honorReceivedCount >= level.one.min && honorReceivedCount < level.one.max) {
        return '1';
    }
    if (honorReceivedCount >= level.two.min && honorReceivedCount < level.two.max) {
        return '2';
    }
    if (honorReceivedCount >= level.three.min && honorReceivedCount < level.three.max) {
        return '3';
    }
    if (honorReceivedCount >= level.four.min && honorReceivedCount < level.four.max) {
        return '4';
    }
    if (honorReceivedCount >= level.five.min) {
        return '5';
    }
    return '0';
};
