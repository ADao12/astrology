import type { StarName } from './index';

// 首先创建格局相关的类型定义
export type Pattern = {
  description: string;
  score: number;
  stars?: readonly StarName[];
  conditions?: readonly string[];
};

export type PatternResult = {
  name: string;
  description: string;
  score: number;
  type: 'good' | 'bad';
};

export type StarReading = {
  meaning: string;
  good: string;
  bad: string;
};

export type StarReadingResult = {
  star: string;
  reading: string;
};

export type PatternGroups = {
  GOOD_PATTERNS: Record<string, Pattern>;
  BAD_PATTERNS: Record<string, Pattern>;
}; 