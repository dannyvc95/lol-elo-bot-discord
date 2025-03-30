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
