/**
 * Unit Tests: Dashboard Progress & Stats Calculations
 *
 * Tests the progress calculation logic used in dashboard components.
 * Run with: pnpm test __tests__/unit/dashboard/progress-stats.test.ts
 */

describe('Dashboard Progress Calculations', () => {
  describe('Progress Percentage', () => {
    function calculateProgressPercent(answeredCount: number, totalRequirements: number): number {
      return totalRequirements > 0 ? Math.round((answeredCount / totalRequirements) * 100) : 0;
    }

    it('should return 0 when no requirements', () => {
      expect(calculateProgressPercent(0, 0)).toBe(0);
    });

    it('should return 0 when no answered', () => {
      expect(calculateProgressPercent(0, 10)).toBe(0);
    });

    it('should return 100 when all answered', () => {
      expect(calculateProgressPercent(10, 10)).toBe(100);
    });

    it('should return correct percentage for partial completion', () => {
      expect(calculateProgressPercent(5, 10)).toBe(50);
      expect(calculateProgressPercent(3, 10)).toBe(30);
      expect(calculateProgressPercent(7, 10)).toBe(70);
    });

    it('should round to nearest integer', () => {
      expect(calculateProgressPercent(1, 3)).toBe(33); // 33.33...
      expect(calculateProgressPercent(2, 3)).toBe(67); // 66.66...
      expect(calculateProgressPercent(1, 7)).toBe(14); // 14.28...
    });
  });

  describe('Active Item Filtering', () => {
    const closedStatuses = ['Closed Won', 'Closed Lost'];

    function isActiveItem(status: string | null): boolean {
      return !closedStatuses.includes(status || '');
    }

    it('should consider New as active', () => {
      expect(isActiveItem('New')).toBe(true);
    });

    it('should consider In Progress as active', () => {
      expect(isActiveItem('In Progress')).toBe(true);
    });

    it('should consider Under Review as active', () => {
      expect(isActiveItem('Under Review')).toBe(true);
    });

    it('should consider Submitted as active', () => {
      expect(isActiveItem('Submitted')).toBe(true);
    });

    it('should NOT consider Closed Won as active', () => {
      expect(isActiveItem('Closed Won')).toBe(false);
    });

    it('should NOT consider Closed Lost as active', () => {
      expect(isActiveItem('Closed Lost')).toBe(false);
    });

    it('should consider null status as active', () => {
      expect(isActiveItem(null)).toBe(true);
    });
  });

  describe('Aggregate Stats Calculation', () => {
    interface ItemStats {
      total_requirements: number;
      answered_count: number;
    }

    function calculateTotalUnanswered(statsArray: ItemStats[]): number {
      return statsArray.reduce((sum, stats) => {
        return sum + (stats.total_requirements - stats.answered_count);
      }, 0);
    }

    it('should sum unanswered across all items', () => {
      const stats = [
        { total_requirements: 10, answered_count: 5 }, // 5 unanswered
        { total_requirements: 8, answered_count: 3 }, // 5 unanswered
        { total_requirements: 5, answered_count: 5 }, // 0 unanswered
      ];

      expect(calculateTotalUnanswered(stats)).toBe(10);
    });

    it('should return 0 when all are answered', () => {
      const stats = [
        { total_requirements: 10, answered_count: 10 },
        { total_requirements: 5, answered_count: 5 },
      ];

      expect(calculateTotalUnanswered(stats)).toBe(0);
    });

    it('should return total when none are answered', () => {
      const stats = [
        { total_requirements: 10, answered_count: 0 },
        { total_requirements: 5, answered_count: 0 },
      ];

      expect(calculateTotalUnanswered(stats)).toBe(15);
    });

    it('should handle empty array', () => {
      expect(calculateTotalUnanswered([])).toBe(0);
    });
  });

  describe('Similarity Score Color Classes', () => {
    function getSimilarityColorClasses(similarity: number): string {
      const percentage = similarity * 100;

      if (percentage >= 85) {
        return 'bg-purple-700/10 text-purple-700 border-purple-700/20';
      } else if (percentage >= 70) {
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      } else if (percentage >= 50) {
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      } else {
        return 'bg-purple-200/10 text-purple-200 border-purple-200/20';
      }
    }

    it('should return purple-700 for >= 85%', () => {
      expect(getSimilarityColorClasses(0.85)).toContain('purple-700');
      expect(getSimilarityColorClasses(0.9)).toContain('purple-700');
      expect(getSimilarityColorClasses(1.0)).toContain('purple-700');
    });

    it('should return purple-500 for >= 70% and < 85%', () => {
      expect(getSimilarityColorClasses(0.7)).toContain('purple-500');
      expect(getSimilarityColorClasses(0.75)).toContain('purple-500');
      expect(getSimilarityColorClasses(0.84)).toContain('purple-500');
    });

    it('should return purple-400 for >= 50% and < 70%', () => {
      expect(getSimilarityColorClasses(0.5)).toContain('purple-400');
      expect(getSimilarityColorClasses(0.6)).toContain('purple-400');
      expect(getSimilarityColorClasses(0.69)).toContain('purple-400');
    });

    it('should return purple-200 for < 50%', () => {
      expect(getSimilarityColorClasses(0.49)).toContain('purple-200');
      expect(getSimilarityColorClasses(0.3)).toContain('purple-200');
      expect(getSimilarityColorClasses(0)).toContain('purple-200');
    });
  });

  describe('Status Badge Logic', () => {
    function getStatusDisplay(status: string): { color: string; label: string } {
      if (status === 'done') {
        return { color: 'green', label: 'Done' };
      }
      if (status === 'in_progress') {
        return { color: 'blue', label: 'In progress' };
      }
      return { color: 'muted', label: 'Not started' };
    }

    it('should display Done with green for done status', () => {
      const result = getStatusDisplay('done');
      expect(result.color).toBe('green');
      expect(result.label).toBe('Done');
    });

    it('should display In progress with blue for in_progress status', () => {
      const result = getStatusDisplay('in_progress');
      expect(result.color).toBe('blue');
      expect(result.label).toBe('In progress');
    });

    it('should display Not started with muted for not_started status', () => {
      const result = getStatusDisplay('not_started');
      expect(result.color).toBe('muted');
      expect(result.label).toBe('Not started');
    });

    it('should default to Not started for unknown status', () => {
      const result = getStatusDisplay('unknown');
      expect(result.color).toBe('muted');
      expect(result.label).toBe('Not started');
    });
  });

  describe('Optimistic Updates Logic', () => {
    interface OptimisticAssignment {
      reqId: number;
      userId: number | null;
      name: string | null;
    }

    function getAssignment(
      req: { id: number; assignedToUserId: number | null; assignedToName: string | null },
      optimistic: OptimisticAssignment | null
    ): { userId: number | null; name: string | null } {
      if (optimistic && optimistic.reqId === req.id) {
        return { userId: optimistic.userId, name: optimistic.name };
      }
      return { userId: req.assignedToUserId, name: req.assignedToName };
    }

    it('should return optimistic value when matching', () => {
      const req = { id: 1, assignedToUserId: null, assignedToName: null };
      const optimistic = { reqId: 1, userId: 123, name: 'John' };

      const result = getAssignment(req, optimistic);
      expect(result.userId).toBe(123);
      expect(result.name).toBe('John');
    });

    it('should return actual value when optimistic is for different req', () => {
      const req = { id: 1, assignedToUserId: 456, assignedToName: 'Jane' };
      const optimistic = { reqId: 2, userId: 123, name: 'John' };

      const result = getAssignment(req, optimistic);
      expect(result.userId).toBe(456);
      expect(result.name).toBe('Jane');
    });

    it('should return actual value when optimistic is null', () => {
      const req = { id: 1, assignedToUserId: 456, assignedToName: 'Jane' };

      const result = getAssignment(req, null);
      expect(result.userId).toBe(456);
      expect(result.name).toBe('Jane');
    });
  });

  describe('Recent Items Sorting', () => {
    interface ItemData {
      id: number;
      title: string;
      updated_at: string;
    }

    function sortByUpdatedAt(items: ItemData[]): ItemData[] {
      return [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    it('should sort items by updated_at descending', () => {
      const items = [
        { id: 1, title: 'Old', updated_at: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'New', updated_at: '2024-01-03T00:00:00Z' },
        { id: 3, title: 'Middle', updated_at: '2024-01-02T00:00:00Z' },
      ];

      const sorted = sortByUpdatedAt(items);
      expect(sorted[0].id).toBe(2); // New
      expect(sorted[1].id).toBe(3); // Middle
      expect(sorted[2].id).toBe(1); // Old
    });

    it('should handle empty array', () => {
      expect(sortByUpdatedAt([])).toEqual([]);
    });

    it('should handle single item', () => {
      const items = [{ id: 1, title: 'Only', updated_at: '2024-01-01T00:00:00Z' }];
      expect(sortByUpdatedAt(items)).toHaveLength(1);
    });
  });

  describe('List Slicing', () => {
    it('should take only first 3 items for dashboard', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      const dashboardItems = items.slice(0, 3);

      expect(dashboardItems).toHaveLength(3);
      expect(dashboardItems[0].id).toBe(1);
      expect(dashboardItems[2].id).toBe(3);
    });

    it('should return all if fewer than 3', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const dashboardItems = items.slice(0, 3);

      expect(dashboardItems).toHaveLength(2);
    });

    it('should take only first 5 requirements for dashboard', () => {
      const reqs = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      const dashboardReqs = reqs.slice(0, 5);

      expect(dashboardReqs).toHaveLength(5);
    });
  });

  describe('Historical Match Filtering', () => {
    interface HistoricalMatchSettings {
      minSimilarity: number;
      minEvaluationRank: number;
      includeUnrated: boolean;
    }

    interface HistoricalMatch {
      similarity: number;
      evaluationRank: number | null;
      editedResponse: string | null;
    }

    function filterHistoricalMatches(
      matches: HistoricalMatch[],
      settings: HistoricalMatchSettings
    ): HistoricalMatch[] {
      return matches.filter((match) => {
        // Must meet minimum similarity
        if (match.similarity < settings.minSimilarity) {
          return false;
        }

        // Must have a response
        if (!match.editedResponse) {
          return false;
        }

        // Check evaluation rank
        if (match.evaluationRank === null) {
          return settings.includeUnrated;
        }

        return match.evaluationRank >= settings.minEvaluationRank;
      });
    }

    it('should filter by minimum similarity', () => {
      const matches = [
        { similarity: 0.8, evaluationRank: 4, editedResponse: 'Response' },
        { similarity: 0.6, evaluationRank: 4, editedResponse: 'Response' },
      ];

      const settings = { minSimilarity: 0.7, minEvaluationRank: 4, includeUnrated: false };
      const filtered = filterHistoricalMatches(matches, settings);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].similarity).toBe(0.8);
    });

    it('should filter by minimum evaluation rank', () => {
      const matches = [
        { similarity: 0.8, evaluationRank: 5, editedResponse: 'Response' },
        { similarity: 0.8, evaluationRank: 3, editedResponse: 'Response' },
      ];

      const settings = { minSimilarity: 0.7, minEvaluationRank: 4, includeUnrated: false };
      const filtered = filterHistoricalMatches(matches, settings);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].evaluationRank).toBe(5);
    });

    it('should exclude unrated when includeUnrated is false', () => {
      const matches = [
        { similarity: 0.8, evaluationRank: 4, editedResponse: 'Response' },
        { similarity: 0.8, evaluationRank: null, editedResponse: 'Response' },
      ];

      const settings = { minSimilarity: 0.7, minEvaluationRank: 4, includeUnrated: false };
      const filtered = filterHistoricalMatches(matches, settings);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].evaluationRank).toBe(4);
    });

    it('should include unrated when includeUnrated is true', () => {
      const matches = [
        { similarity: 0.8, evaluationRank: 4, editedResponse: 'Response' },
        { similarity: 0.8, evaluationRank: null, editedResponse: 'Response' },
      ];

      const settings = { minSimilarity: 0.7, minEvaluationRank: 4, includeUnrated: true };
      const filtered = filterHistoricalMatches(matches, settings);

      expect(filtered).toHaveLength(2);
    });

    it('should exclude matches without response', () => {
      const matches = [
        { similarity: 0.8, evaluationRank: 4, editedResponse: 'Response' },
        { similarity: 0.8, evaluationRank: 4, editedResponse: null },
      ];

      const settings = { minSimilarity: 0.7, minEvaluationRank: 4, includeUnrated: false };
      const filtered = filterHistoricalMatches(matches, settings);

      expect(filtered).toHaveLength(1);
    });
  });
});
