import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load knowledge base
const dataPath = join(__dirname, 'data.json');
export const knowledgeBase = JSON.parse(readFileSync(dataPath, 'utf-8'));

export interface SearchResult {
  path: string;
  content: string;
  score: number;
}

/**
 * Search the knowledge base for a query
 */
export function searchKnowledgeBase(query: string): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  const results: SearchResult[] = [];

  function searchObj(obj: any, path: string = ''): void {
    if (typeof obj === 'string') {
      const contentLower = obj.toLowerCase();
      let score = 0;

      // Full query match
      if (contentLower.includes(queryLower)) {
        score += 10;
      }

      // Individual term matches
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          score += 2;
        }
      }

      if (score > 0) {
        results.push({ path, content: obj, score });
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => searchObj(item, `${path}[${i}]`));
    } else if (typeof obj === 'object' && obj !== null) {
      // Also check keys for matches
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        let keyScore = 0;

        if (keyLower.includes(queryLower) || queryTerms.some(t => keyLower.includes(t))) {
          keyScore = 5;
        }

        if (keyScore > 0 && typeof value !== 'object') {
          results.push({
            path: path ? `${path}.${key}` : key,
            content: String(value),
            score: keyScore
          });
        }

        searchObj(value, path ? `${path}.${key}` : key);
      }
    }
  }

  searchObj(knowledgeBase);

  // Sort by score and deduplicate
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/**
 * Get a specific section of the knowledge base
 */
export function getSection(section: string): any {
  const parts = section.split('.');
  let current: any = knowledgeBase;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Find an action by ID or name
 */
export function findAction(search: string): any {
  const searchLower = search.toLowerCase();
  const searchNum = parseInt(search);

  const allActions = [
    ...knowledgeBase.actions.transport,
    ...knowledgeBase.actions.editing,
    ...knowledgeBase.actions.tracks,
    ...knowledgeBase.actions.zoom,
    ...knowledgeBase.actions.markers,
    ...knowledgeBase.actions.recording,
    ...knowledgeBase.actions.fx,
    ...knowledgeBase.actions.tempo,
    ...knowledgeBase.actions.midi,
    ...knowledgeBase.actions.view,
  ];

  // Search by ID first
  if (!isNaN(searchNum)) {
    const byId = allActions.find(a => a.id === searchNum);
    if (byId) return byId;
  }

  // Search by name
  return allActions.filter(a =>
    a.name.toLowerCase().includes(searchLower)
  );
}

/**
 * Find a plugin by name
 */
export function findPlugin(name: string): any {
  const nameLower = name.toLowerCase();
  return knowledgeBase.plugins.reaPlugs.plugins.find(
    (p: any) => p.name.toLowerCase().includes(nameLower)
  );
}

/**
 * Get troubleshooting help for an issue
 */
export function getTroubleshooting(issue?: string): any {
  if (!issue) {
    return knowledgeBase.troubleshooting;
  }

  const issueLower = issue.toLowerCase();
  return knowledgeBase.troubleshooting.commonIssues.find(
    (i: any) => i.issue.toLowerCase().includes(issueLower)
  );
}
