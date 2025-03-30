export interface ChampionMasteryDTO {
    puuid: string; // Player Universal Unique Identifier (78 characters)
    championPointsUntilNextLevel: number; // Points needed to achieve the next level (0 if max level reached)
    chestGranted: boolean; // Whether chest is granted for this champion in the current season
    championId: number; // Champion ID for this entry
    lastPlayTime: number; // Last time the champion was played (Unix milliseconds time format)
    championLevel: number; // Champion level for player and champion combination
    championPoints: number; // Total champion points for this player and champion combination
    championPointsSinceLastLevel: number; // Points earned since the current level
    markRequiredForNextLevel: number; // Marks required for the next level
    championSeasonMilestone: number; // Champion season milestone
    nextSeasonMilestone: NextSeasonMilestonesDTO; // Next season milestone info
    tokensEarned: number; // Tokens earned for the current champion level
    milestoneGrades: string[]; // List of milestone grades
}

interface NextSeasonMilestonesDTO {
    requireGradeCounts: object; // Object containing required grade counts
    rewardMarks: number; // Reward marks
    bonus: boolean; // Whether there is a bonus
    rewardConfig: RewardConfigDTO; // Reward configuration
}

interface RewardConfigDTO {
    rewardValue: string; // Reward value
    rewardType: string; // Reward type
    maximumReward: number; // Maximum reward
}
