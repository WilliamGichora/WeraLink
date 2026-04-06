export interface Skill {
    id: string;
    name: string;
    category: string;
}

export interface UserSkill {
    id: string;
    level: number;
    verified: boolean;
    skill: Skill;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    criteria: string;
}

export interface UserBadge {
    id: string;
    awardedAt: string;
    badge: Badge;
}

export interface Rating {
    score: number;
    comment: string;
    createdAt: string;
    rater: { name: string };
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    url: string;
    type: 'IMAGE' | 'DOCUMENT' | 'LINK';
}

export interface ProfileData {
    bio?: string;
    location?: string;
    availabilityStatus: boolean;
    portfolio?: PortfolioItem[];
    verified: boolean;
    user: {
        name: string;
        email: string;
        phone: string;
        role: 'WORKER' | 'EMPLOYER' | 'ADMIN';
        status: string;
        skills?: UserSkill[];
        badges?: UserBadge[];
        ratingsRecv?: Rating[];
    };
}
