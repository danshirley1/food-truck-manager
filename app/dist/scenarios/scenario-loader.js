"use strict";
/**
 * Scenario loading and selection logic
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const validation_1 = require("../types/validation");
const helpers_1 = require("../utils/helpers");
class ScenarioLoader {
    /**
     * Load static scenarios from JSON file
     */
    static loadStaticScenarios() {
        if (this.staticScenarios) {
            return this.staticScenarios;
        }
        try {
            const scenariosPath = path.join(__dirname, 'static-scenarios.json');
            const rawData = fs.readFileSync(scenariosPath, 'utf-8');
            const parsedData = JSON.parse(rawData);
            // Validate each scenario
            const validatedData = {
                early: [],
                mid: [],
                late: []
            };
            for (const difficulty of ['early', 'mid', 'late']) {
                const scenarios = parsedData[difficulty] || [];
                for (const scenario of scenarios) {
                    try {
                        // Add createdAt if not present
                        if (!scenario.createdAt) {
                            scenario.createdAt = new Date();
                        }
                        const validatedScenario = validation_1.ScenarioSchema.parse(scenario);
                        validatedData[difficulty].push(validatedScenario);
                    }
                    catch (error) {
                        console.warn(`Invalid scenario ${scenario.id}:`, error);
                    }
                }
            }
            this.staticScenarios = validatedData;
            return this.staticScenarios;
        }
        catch (error) {
            console.error('Failed to load static scenarios:', error);
            return { early: [], mid: [], late: [] };
        }
    }
    /**
     * Get a scenario appropriate for the current game context
     */
    static getScenario(context) {
        const staticScenarios = this.loadStaticScenarios();
        const availableScenarios = staticScenarios[context.difficultyLevel] || [];
        if (availableScenarios.length === 0) {
            return null;
        }
        // Filter scenarios to avoid recent repeats
        const recentTags = new Set(context.recentChoices);
        const preferredScenarios = availableScenarios.filter(scenario => {
            return !scenario.tags.some(tag => recentTags.has(tag));
        });
        // Use preferred scenarios if available, otherwise use any available
        const candidateScenarios = preferredScenarios.length > 0
            ? preferredScenarios
            : availableScenarios;
        return (0, helpers_1.randomChoice)(candidateScenarios);
    }
    /**
     * Get all scenarios for a specific difficulty level
     */
    static getScenariosByDifficulty(difficulty) {
        const staticScenarios = this.loadStaticScenarios();
        return staticScenarios[difficulty] || [];
    }
    /**
     * Get scenarios by tag
     */
    static getScenariosByTag(tag) {
        const staticScenarios = this.loadStaticScenarios();
        const allScenarios = [
            ...staticScenarios.early,
            ...staticScenarios.mid,
            ...staticScenarios.late
        ];
        return allScenarios.filter(scenario => scenario.tags.includes(tag));
    }
    /**
     * Get scenario by ID
     */
    static getScenarioById(id) {
        const staticScenarios = this.loadStaticScenarios();
        const allScenarios = [
            ...staticScenarios.early,
            ...staticScenarios.mid,
            ...staticScenarios.late
        ];
        return allScenarios.find(scenario => scenario.id === id) || null;
    }
    /**
     * Get recent choice tags from game state for context
     */
    static getRecentChoiceTags(choiceHistory, limit = 3) {
        // This would need to be implemented based on how we track scenario tags
        // For now, return empty array
        return [];
    }
    /**
     * Validate a scenario object
     */
    static validateScenario(scenario) {
        try {
            return validation_1.ScenarioSchema.parse(scenario);
        }
        catch (error) {
            console.warn('Scenario validation failed:', error);
            return null;
        }
    }
}
exports.ScenarioLoader = ScenarioLoader;
ScenarioLoader.staticScenarios = null;
//# sourceMappingURL=scenario-loader.js.map