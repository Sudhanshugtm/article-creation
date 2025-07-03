// ABOUTME: Draft lifecycle management system to track and prevent abandonment
// ABOUTME: Monitors draft progress and triggers interventions for at-risk editors

interface DraftStatus {
    id: string;
    title: string;
    created: Date;
    lastEdited: Date;
    editCount: number;
    wordCount: number;
    status: 'active' | 'inactive' | 'submitted' | 'declined' | 'accepted' | 'abandoned';
    editorUsername: string;
    category: ArticleCategory;
    qualityScore: number; // 0-100
    completionPercentage: number; // 0-100
}

interface EditHistory {
    edits: {
        timestamp: Date;
        wordCountChange: number;
        editSummary: string;
        editType: 'content' | 'formatting' | 'references' | 'templates';
    }[];
    totalEdits: number;
    uniqueDays: number;
    averageSessionLength: number; // minutes
    lastActiveDate: Date;
}

interface RiskScore {
    overall: number; // 0-100 (higher = more likely to abandon)
    factors: {
        timeInactive: number;
        editPattern: number;
        qualityStagnation: number;
        communityFeedback: number;
        editorExperience: number;
    };
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
}

interface AfCDecline {
    reason: string;
    reviewerComments: string;
    declineDate: Date;
    specificIssues: string[];
    suggestedImprovements: string[];
    resubmissionEligible: boolean;
}

interface SupportPlan {
    interventionType: 'mentorship' | 'guidance' | 'technical_help' | 'motivation';
    actions: {
        immediate: string[];
        followUp: string[];
        longTerm: string[];
    };
    resources: {
        helpPages: string[];
        tutorials: string[];
        examples: string[];
    };
    timeframe: string;
    successMetrics: string[];
}

interface InterventionTrigger {
    triggerId: string;
    draftId: string;
    triggerType: 'time_inactive' | 'quality_stagnant' | 'edit_frequency_drop' | 'negative_feedback';
    severity: 'low' | 'medium' | 'high';
    triggeredAt: Date;
    actionTaken: boolean;
    outcome?: 'editor_returned' | 'abandonment_prevented' | 'abandoned_anyway';
}

export class DraftLifecycleManager {
    private readonly monitoringInterval: number = 24 * 60 * 60 * 1000; // 24 hours
    private readonly abandonmentThresholds = {
        timeInactive: {
            warning: 3, // days
            critical: 7,
            abandon: 30
        },
        editFrequency: {
            healthy: 1, // edits per week
            warning: 0.5,
            critical: 0.1
        },
        qualityImprovement: {
            expectedWeekly: 5, // points per week
            stagnationWarning: 14 // days without improvement
        }
    };

    private draftDatabase: Map<string, DraftStatus> = new Map();
    private editHistories: Map<string, EditHistory> = new Map();
    private interventionHistory: Map<string, InterventionTrigger[]> = new Map();

    constructor() {
        this.startMonitoring();
    }

    /**
     * Tracks progress of a draft article
     */
    async trackDraftProgress(draftId: string): Promise<DraftStatus> {
        try {
            // Fetch current draft data
            const currentData = await this.fetchDraftData(draftId);
            
            // Update local tracking
            const status: DraftStatus = {
                id: draftId,
                title: currentData.title,
                created: currentData.created,
                lastEdited: currentData.lastEdited,
                editCount: currentData.editCount,
                wordCount: currentData.wordCount,
                status: this.calculateDraftStatus(currentData),
                editorUsername: currentData.editor,
                category: currentData.category,
                qualityScore: await this.calculateQualityScore(currentData),
                completionPercentage: this.calculateCompletionPercentage(currentData)
            };

            this.draftDatabase.set(draftId, status);
            
            // Update edit history
            await this.updateEditHistory(draftId, currentData.recentEdits);
            
            return status;
        } catch (error) {
            console.error('Error tracking draft progress:', error);
            throw error;
        }
    }

    /**
     * Calculates abandonment risk score for a draft
     */
    calculateAbandonmentRisk(editorActivity: EditHistory): RiskScore {
        const factors = {
            timeInactive: this.calculateTimeInactiveRisk(editorActivity),
            editPattern: this.calculateEditPatternRisk(editorActivity),
            qualityStagnation: this.calculateQualityStagnationRisk(editorActivity),
            communityFeedback: this.calculateCommunityFeedbackRisk(),
            editorExperience: this.calculateEditorExperienceRisk(editorActivity)
        };

        // Weighted average of risk factors
        const overall = (
            factors.timeInactive * 0.3 +
            factors.editPattern * 0.25 +
            factors.qualityStagnation * 0.2 +
            factors.communityFeedback * 0.15 +
            factors.editorExperience * 0.1
        );

        const riskLevel = this.determineRiskLevel(overall);
        const recommendedActions = this.generateRecommendedActions(factors, riskLevel);

        return {
            overall,
            factors,
            riskLevel,
            recommendedActions
        };
    }

    /**
     * Triggers intervention for at-risk drafts
     */
    async triggerIntervention(
        draftId: string, 
        riskLevel: 'high' | 'medium',
        specificTrigger?: string
    ): Promise<void> {
        try {
            const draft = this.draftDatabase.get(draftId);
            if (!draft) {
                throw new Error(`Draft ${draftId} not found`);
            }

            const trigger: InterventionTrigger = {
                triggerId: `INT_${Date.now()}`,
                draftId,
                triggerType: this.determineTriggerType(specificTrigger),
                severity: riskLevel,
                triggeredAt: new Date(),
                actionTaken: false
            };

            // Execute intervention based on risk level
            if (riskLevel === 'high') {
                await this.executeHighRiskIntervention(draft, trigger);
            } else if (riskLevel === 'medium') {
                await this.executeMediumRiskIntervention(draft, trigger);
            }

            // Record intervention
            const interventions = this.interventionHistory.get(draftId) || [];
            interventions.push({ ...trigger, actionTaken: true });
            this.interventionHistory.set(draftId, interventions);

        } catch (error) {
            console.error('Error triggering intervention:', error);
            throw error;
        }
    }

    /**
     * Provides specialized support after AfC decline
     */
    async provideDeclineSupport(decline: AfCDecline): Promise<SupportPlan> {
        try {
            const supportType = this.determineSupportType(decline);
            
            const plan: SupportPlan = {
                interventionType: supportType,
                actions: this.generateSupportActions(decline, supportType),
                resources: this.gatherSupportResources(decline),
                timeframe: this.calculateSupportTimeframe(decline),
                successMetrics: this.defineSupportSuccessMetrics(decline)
            };

            return plan;
        } catch (error) {
            console.error('Error providing decline support:', error);
            throw error;
        }
    }

    /**
     * Monitors all tracked drafts for abandonment risk
     */
    async monitorAllDrafts(): Promise<{
        totalTracked: number;
        atRisk: number;
        interventionsTriggered: number;
        abandonmentsPrevented: number;
    }> {
        let atRisk = 0;
        let interventionsTriggered = 0;
        let abandonmentsPrevented = 0;

        for (const [draftId, draft] of this.draftDatabase) {
            try {
                // Update draft status
                await this.trackDraftProgress(draftId);
                
                // Check abandonment risk
                const editHistory = this.editHistories.get(draftId);
                if (editHistory) {
                    const risk = this.calculateAbandonmentRisk(editHistory);
                    
                    if (risk.riskLevel === 'high' || risk.riskLevel === 'critical') {
                        atRisk++;
                        
                        // Check if intervention already triggered recently
                        const recentInterventions = this.getRecentInterventions(draftId, 7); // 7 days
                        if (recentInterventions.length === 0) {
                            await this.triggerIntervention(draftId, risk.riskLevel as 'high' | 'medium');
                            interventionsTriggered++;
                        }
                    }
                }
                
                // Check if previous interventions were successful
                const successfulInterventions = this.checkInterventionSuccess(draftId);
                abandonmentsPrevented += successfulInterventions;
                
            } catch (error) {
                console.error(`Error monitoring draft ${draftId}:`, error);
            }
        }

        return {
            totalTracked: this.draftDatabase.size,
            atRisk,
            interventionsTriggered,
            abandonmentsPrevented
        };
    }

    // Private helper methods

    private startMonitoring(): void {
        setInterval(() => {
            this.monitorAllDrafts().catch(error => {
                console.error('Monitoring error:', error);
            });
        }, this.monitoringInterval);
    }

    private async fetchDraftData(draftId: string): Promise<any> {
        // In real implementation, this would fetch from Wikipedia API
        return {
            title: `Draft:Example ${draftId}`,
            created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            editCount: 15,
            wordCount: 2500,
            editor: 'NewEditor123',
            category: 'PERSON' as ArticleCategory,
            recentEdits: []
        };
    }

    private calculateDraftStatus(data: any): DraftStatus['status'] {
        const daysSinceEdit = (Date.now() - data.lastEdited.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysSinceEdit > 30) return 'abandoned';
        if (daysSinceEdit > 7) return 'inactive';
        if (data.editCount > 0) return 'active';
        return 'inactive';
    }

    private async calculateQualityScore(data: any): Promise<number> {
        // Simplified quality scoring
        let score = 0;
        
        // Word count score (0-30 points)
        score += Math.min(30, (data.wordCount / 1000) * 30);
        
        // Edit count score (0-20 points) 
        score += Math.min(20, (data.editCount / 10) * 20);
        
        // References score (0-25 points) - would check for actual references
        score += 15; // placeholder
        
        // Structure score (0-25 points) - would check for proper sections
        score += 20; // placeholder
        
        return Math.min(100, score);
    }

    private calculateCompletionPercentage(data: any): number {
        // Simplified completion calculation
        const factors = {
            hasIntro: data.wordCount > 100 ? 25 : 0,
            hasReferences: 20, // placeholder
            hasInfobox: 15, // placeholder  
            hasCategories: 10, // placeholder
            adequateLength: data.wordCount > 500 ? 30 : (data.wordCount / 500) * 30
        };
        
        return Object.values(factors).reduce((sum, value) => sum + value, 0);
    }

    private async updateEditHistory(draftId: string, recentEdits: any[]): Promise<void> {
        // Update edit tracking data
        const existing = this.editHistories.get(draftId) || {
            edits: [],
            totalEdits: 0,
            uniqueDays: 0,
            averageSessionLength: 0,
            lastActiveDate: new Date()
        };
        
        // Process new edits (simplified)
        existing.totalEdits += recentEdits.length;
        existing.lastActiveDate = new Date();
        
        this.editHistories.set(draftId, existing);
    }

    private calculateTimeInactiveRisk(activity: EditHistory): number {
        const daysSinceLastEdit = (Date.now() - activity.lastActiveDate.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysSinceLastEdit >= this.abandonmentThresholds.timeInactive.abandon) return 100;
        if (daysSinceLastEdit >= this.abandonmentThresholds.timeInactive.critical) return 80;
        if (daysSinceLastEdit >= this.abandonmentThresholds.timeInactive.warning) return 50;
        return Math.min(40, daysSinceLastEdit * 10);
    }

    private calculateEditPatternRisk(activity: EditHistory): number {
        const editsPerWeek = activity.totalEdits / (activity.uniqueDays / 7);
        
        if (editsPerWeek >= this.abandonmentThresholds.editFrequency.healthy) return 0;
        if (editsPerWeek >= this.abandonmentThresholds.editFrequency.warning) return 30;
        if (editsPerWeek >= this.abandonmentThresholds.editFrequency.critical) return 60;
        return 90;
    }

    private calculateQualityStagnationRisk(activity: EditHistory): number {
        // Simplified - would track quality improvements over time
        return 25; // placeholder
    }

    private calculateCommunityFeedbackRisk(): number {
        // Would analyze community interactions
        return 20; // placeholder
    }

    private calculateEditorExperienceRisk(activity: EditHistory): number {
        // New editors are higher risk
        if (activity.totalEdits < 5) return 70;
        if (activity.totalEdits < 20) return 40;
        if (activity.totalEdits < 50) return 20;
        return 10;
    }

    private determineRiskLevel(overall: number): RiskScore['riskLevel'] {
        if (overall >= 80) return 'critical';
        if (overall >= 60) return 'high';
        if (overall >= 30) return 'medium';
        return 'low';
    }

    private generateRecommendedActions(factors: RiskScore['factors'], riskLevel: string): string[] {
        const actions: string[] = [];
        
        if (factors.timeInactive > 50) {
            actions.push('Send re-engagement message');
            actions.push('Offer editing assistance');
        }
        
        if (factors.editPattern > 50) {
            actions.push('Suggest editing schedule');
            actions.push('Provide motivation');
        }
        
        if (factors.qualityStagnation > 50) {
            actions.push('Offer quality improvement guidance');
            actions.push('Connect with subject expert');
        }
        
        if (riskLevel === 'high' || riskLevel === 'critical') {
            actions.push('Assign dedicated mentor');
            actions.push('Priority community support');
        }
        
        return actions;
    }

    private determineTriggerType(trigger?: string): InterventionTrigger['triggerType'] {
        if (trigger?.includes('inactive')) return 'time_inactive';
        if (trigger?.includes('quality')) return 'quality_stagnant';
        if (trigger?.includes('frequency')) return 'edit_frequency_drop';
        if (trigger?.includes('feedback')) return 'negative_feedback';
        return 'time_inactive';
    }

    private async executeHighRiskIntervention(draft: DraftStatus, trigger: InterventionTrigger): Promise<void> {
        // High-priority intervention actions
        console.log(`Executing high-risk intervention for draft: ${draft.title}`);
        
        // Would implement:
        // - Immediate mentor assignment
        // - Personal message to editor
        // - Community notification
        // - Offer direct assistance
    }

    private async executeMediumRiskIntervention(draft: DraftStatus, trigger: InterventionTrigger): Promise<void> {
        // Medium-priority intervention actions
        console.log(`Executing medium-risk intervention for draft: ${draft.title}`);
        
        // Would implement:
        // - Helpful reminder message
        // - Resource suggestions
        // - Gentle encouragement
    }

    private determineSupportType(decline: AfCDecline): SupportPlan['interventionType'] {
        if (decline.reason.includes('notability')) return 'guidance';
        if (decline.reason.includes('sources')) return 'technical_help';
        if (decline.reason.includes('tone')) return 'mentorship';
        return 'motivation';
    }

    private generateSupportActions(decline: AfCDecline, type: SupportPlan['interventionType']): SupportPlan['actions'] {
        const baseActions = {
            immediate: [
                'Send personalized decline explanation',
                'Offer specific improvement guidance'
            ],
            followUp: [
                'Check progress in 3 days',
                'Offer additional help if needed'
            ],
            longTerm: [
                'Monitor for resubmission',
                'Celebrate improvements'
            ]
        };
        
        // Customize based on support type
        if (type === 'mentorship') {
            baseActions.immediate.push('Assign experienced mentor');
        }
        
        return baseActions;
    }

    private gatherSupportResources(decline: AfCDecline): SupportPlan['resources'] {
        return {
            helpPages: [
                'Wikipedia:Your first article',
                'Wikipedia:Reliable sources',
                'Wikipedia:Notability'
            ],
            tutorials: [
                'Wikipedia:Tutorial/Creating articles',
                'Wikipedia:Citing sources'
            ],
            examples: [
                'Featured articles in similar topics',
                'Good article examples'
            ]
        };
    }

    private calculateSupportTimeframe(decline: AfCDecline): string {
        if (decline.resubmissionEligible) {
            return '1-2 weeks for improvement and resubmission';
        }
        return '2-4 weeks for major revisions';
    }

    private defineSupportSuccessMetrics(decline: AfCDecline): string[] {
        return [
            'Editor continues editing within 7 days',
            'Draft shows measurable improvement',
            'Editor engages with provided resources',
            'Resubmission occurs if eligible'
        ];
    }

    private getRecentInterventions(draftId: string, days: number): InterventionTrigger[] {
        const interventions = this.interventionHistory.get(draftId) || [];
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        return interventions.filter(intervention => 
            intervention.triggeredAt > cutoffDate
        );
    }

    private checkInterventionSuccess(draftId: string): number {
        const interventions = this.interventionHistory.get(draftId) || [];
        return interventions.filter(intervention => 
            intervention.outcome === 'abandonment_prevented' || 
            intervention.outcome === 'editor_returned'
        ).length;
    }
}