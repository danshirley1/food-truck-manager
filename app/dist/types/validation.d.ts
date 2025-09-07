/**
 * Zod validation schemas for Food Truck Manager
 * Ensures type safety and validates AI-generated content
 */
import { z } from 'zod';
export declare const ResourcesSchema: z.ZodObject<{
    money: z.ZodNumber;
    reputation: z.ZodNumber;
    energy: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    money: number;
    reputation: number;
    energy: number;
}, {
    money: number;
    reputation: number;
    energy: number;
}>;
export declare const ResourceEffectsSchema: z.ZodObject<{
    money: z.ZodOptional<z.ZodNumber>;
    reputation: z.ZodOptional<z.ZodNumber>;
    energy: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    money?: number | undefined;
    reputation?: number | undefined;
    energy?: number | undefined;
}, {
    money?: number | undefined;
    reputation?: number | undefined;
    energy?: number | undefined;
}>;
export declare const RiskLevelSchema: z.ZodEnum<["safe", "moderate", "risky"]>;
export declare const ChoiceSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    effects: z.ZodObject<{
        money: z.ZodOptional<z.ZodNumber>;
        reputation: z.ZodOptional<z.ZodNumber>;
        energy: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    }, {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    }>;
    riskLevel: z.ZodOptional<z.ZodEnum<["safe", "moderate", "risky"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    effects: {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    };
    riskLevel?: "safe" | "moderate" | "risky" | undefined;
}, {
    id: string;
    label: string;
    effects: {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    };
    riskLevel?: "safe" | "moderate" | "risky" | undefined;
}>;
export declare const DifficultyLevelSchema: z.ZodEnum<["early", "mid", "late"]>;
export declare const ScenarioTagSchema: z.ZodEnum<["customer-service", "supply-management", "equipment", "permits", "competition", "weather", "community-event", "crisis", "expansion"]>;
export declare const ScenarioSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    text: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        effects: z.ZodObject<{
            money: z.ZodOptional<z.ZodNumber>;
            reputation: z.ZodOptional<z.ZodNumber>;
            energy: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        }, {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        }>;
        riskLevel: z.ZodOptional<z.ZodEnum<["safe", "moderate", "risky"]>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        riskLevel?: "safe" | "moderate" | "risky" | undefined;
    }, {
        id: string;
        label: string;
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        riskLevel?: "safe" | "moderate" | "risky" | undefined;
    }>, "many">;
    tags: z.ZodArray<z.ZodEnum<["customer-service", "supply-management", "equipment", "permits", "competition", "weather", "community-event", "crisis", "expansion"]>, "many">;
    difficulty: z.ZodEnum<["early", "mid", "late"]>;
    createdBy: z.ZodEnum<["ai", "static"]>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    text: string;
    choices: {
        id: string;
        label: string;
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        riskLevel?: "safe" | "moderate" | "risky" | undefined;
    }[];
    tags: ("customer-service" | "supply-management" | "equipment" | "permits" | "competition" | "weather" | "community-event" | "crisis" | "expansion")[];
    difficulty: "early" | "mid" | "late";
    createdBy: "ai" | "static";
    createdAt?: Date | undefined;
}, {
    id: string;
    title: string;
    text: string;
    choices: {
        id: string;
        label: string;
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        riskLevel?: "safe" | "moderate" | "risky" | undefined;
    }[];
    tags: ("customer-service" | "supply-management" | "equipment" | "permits" | "competition" | "weather" | "community-event" | "crisis" | "expansion")[];
    difficulty: "early" | "mid" | "late";
    createdBy: "ai" | "static";
    createdAt?: Date | undefined;
}>;
export declare const EndReasonSchema: z.ZodEnum<["victory", "burnout", "reputation-death", "bankruptcy"]>;
export declare const AchievementCategorySchema: z.ZodEnum<["survival", "excellence", "strategy", "collection"]>;
export declare const AchievementSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    unlockedAt: z.ZodOptional<z.ZodDate>;
    category: z.ZodEnum<["survival", "excellence", "strategy", "collection"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    category: "survival" | "excellence" | "strategy" | "collection";
    unlockedAt?: Date | undefined;
}, {
    id: string;
    name: string;
    description: string;
    category: "survival" | "excellence" | "strategy" | "collection";
    unlockedAt?: Date | undefined;
}>;
export declare const ChoiceRecordSchema: z.ZodObject<{
    turn: z.ZodNumber;
    scenarioId: z.ZodString;
    choiceId: z.ZodString;
    effects: z.ZodObject<{
        money: z.ZodOptional<z.ZodNumber>;
        reputation: z.ZodOptional<z.ZodNumber>;
        energy: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    }, {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    }>;
    resourcesBefore: z.ZodObject<{
        money: z.ZodNumber;
        reputation: z.ZodNumber;
        energy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        money: number;
        reputation: number;
        energy: number;
    }, {
        money: number;
        reputation: number;
        energy: number;
    }>;
    resourcesAfter: z.ZodObject<{
        money: z.ZodNumber;
        reputation: z.ZodNumber;
        energy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        money: number;
        reputation: number;
        energy: number;
    }, {
        money: number;
        reputation: number;
        energy: number;
    }>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    effects: {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    };
    turn: number;
    scenarioId: string;
    choiceId: string;
    resourcesBefore: {
        money: number;
        reputation: number;
        energy: number;
    };
    resourcesAfter: {
        money: number;
        reputation: number;
        energy: number;
    };
    timestamp: Date;
}, {
    effects: {
        money?: number | undefined;
        reputation?: number | undefined;
        energy?: number | undefined;
    };
    turn: number;
    scenarioId: string;
    choiceId: string;
    resourcesBefore: {
        money: number;
        reputation: number;
        energy: number;
    };
    resourcesAfter: {
        money: number;
        reputation: number;
        energy: number;
    };
    timestamp: Date;
}>;
export declare const GameStateSchema: z.ZodObject<{
    sessionId: z.ZodString;
    turn: z.ZodNumber;
    resources: z.ZodObject<{
        money: z.ZodNumber;
        reputation: z.ZodNumber;
        energy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        money: number;
        reputation: number;
        energy: number;
    }, {
        money: number;
        reputation: number;
        energy: number;
    }>;
    gameOver: z.ZodBoolean;
    endReason: z.ZodOptional<z.ZodEnum<["victory", "burnout", "reputation-death", "bankruptcy"]>>;
    score: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    randomSeed: z.ZodOptional<z.ZodString>;
    choiceHistory: z.ZodArray<z.ZodObject<{
        turn: z.ZodNumber;
        scenarioId: z.ZodString;
        choiceId: z.ZodString;
        effects: z.ZodObject<{
            money: z.ZodOptional<z.ZodNumber>;
            reputation: z.ZodOptional<z.ZodNumber>;
            energy: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        }, {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        }>;
        resourcesBefore: z.ZodObject<{
            money: z.ZodNumber;
            reputation: z.ZodNumber;
            energy: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            money: number;
            reputation: number;
            energy: number;
        }, {
            money: number;
            reputation: number;
            energy: number;
        }>;
        resourcesAfter: z.ZodObject<{
            money: z.ZodNumber;
            reputation: z.ZodNumber;
            energy: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            money: number;
            reputation: number;
            energy: number;
        }, {
            money: number;
            reputation: number;
            energy: number;
        }>;
        timestamp: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        turn: number;
        scenarioId: string;
        choiceId: string;
        resourcesBefore: {
            money: number;
            reputation: number;
            energy: number;
        };
        resourcesAfter: {
            money: number;
            reputation: number;
            energy: number;
        };
        timestamp: Date;
    }, {
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        turn: number;
        scenarioId: string;
        choiceId: string;
        resourcesBefore: {
            money: number;
            reputation: number;
            energy: number;
        };
        resourcesAfter: {
            money: number;
            reputation: number;
            energy: number;
        };
        timestamp: Date;
    }>, "many">;
    achievements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        unlockedAt: z.ZodOptional<z.ZodDate>;
        category: z.ZodEnum<["survival", "excellence", "strategy", "collection"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string;
        category: "survival" | "excellence" | "strategy" | "collection";
        unlockedAt?: Date | undefined;
    }, {
        id: string;
        name: string;
        description: string;
        category: "survival" | "excellence" | "strategy" | "collection";
        unlockedAt?: Date | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    turn: number;
    sessionId: string;
    resources: {
        money: number;
        reputation: number;
        energy: number;
    };
    gameOver: boolean;
    updatedAt: Date;
    choiceHistory: {
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        turn: number;
        scenarioId: string;
        choiceId: string;
        resourcesBefore: {
            money: number;
            reputation: number;
            energy: number;
        };
        resourcesAfter: {
            money: number;
            reputation: number;
            energy: number;
        };
        timestamp: Date;
    }[];
    achievements: {
        id: string;
        name: string;
        description: string;
        category: "survival" | "excellence" | "strategy" | "collection";
        unlockedAt?: Date | undefined;
    }[];
    endReason?: "victory" | "burnout" | "reputation-death" | "bankruptcy" | undefined;
    score?: number | undefined;
    randomSeed?: string | undefined;
}, {
    createdAt: Date;
    turn: number;
    sessionId: string;
    resources: {
        money: number;
        reputation: number;
        energy: number;
    };
    gameOver: boolean;
    updatedAt: Date;
    choiceHistory: {
        effects: {
            money?: number | undefined;
            reputation?: number | undefined;
            energy?: number | undefined;
        };
        turn: number;
        scenarioId: string;
        choiceId: string;
        resourcesBefore: {
            money: number;
            reputation: number;
            energy: number;
        };
        resourcesAfter: {
            money: number;
            reputation: number;
            energy: number;
        };
        timestamp: Date;
    }[];
    achievements: {
        id: string;
        name: string;
        description: string;
        category: "survival" | "excellence" | "strategy" | "collection";
        unlockedAt?: Date | undefined;
    }[];
    endReason?: "victory" | "burnout" | "reputation-death" | "bankruptcy" | undefined;
    score?: number | undefined;
    randomSeed?: string | undefined;
}>;
export declare const ScenarioContextSchema: z.ZodObject<{
    currentResources: z.ZodObject<{
        money: z.ZodNumber;
        reputation: z.ZodNumber;
        energy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        money: number;
        reputation: number;
        energy: number;
    }, {
        money: number;
        reputation: number;
        energy: number;
    }>;
    turn: z.ZodNumber;
    difficultyLevel: z.ZodEnum<["early", "mid", "late"]>;
    recentChoices: z.ZodArray<z.ZodString, "many">;
    availableTags: z.ZodArray<z.ZodEnum<["customer-service", "supply-management", "equipment", "permits", "competition", "weather", "community-event", "crisis", "expansion"]>, "many">;
    randomSeed: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    turn: number;
    currentResources: {
        money: number;
        reputation: number;
        energy: number;
    };
    difficultyLevel: "early" | "mid" | "late";
    recentChoices: string[];
    availableTags: ("customer-service" | "supply-management" | "equipment" | "permits" | "competition" | "weather" | "community-event" | "crisis" | "expansion")[];
    randomSeed?: string | undefined;
}, {
    turn: number;
    currentResources: {
        money: number;
        reputation: number;
        energy: number;
    };
    difficultyLevel: "early" | "mid" | "late";
    recentChoices: string[];
    availableTags: ("customer-service" | "supply-management" | "equipment" | "permits" | "competition" | "weather" | "community-event" | "crisis" | "expansion")[];
    randomSeed?: string | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map