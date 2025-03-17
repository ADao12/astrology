import type { StarName } from '../types';
import type { PatternGroups } from '../types/patterns';

// 格局定义
export const PATTERNS: PatternGroups = {
  // 吉格
  GOOD_PATTERNS: {
    '禄权科格': {
      description: '禄、权、科三星会照',
      conditions: ['化禄', '化权', '化科'],
      score: 90
    },
    '紫府同宫': {
      description: '紫微天府同宫',
      stars: ['紫微', '天府'] as readonly StarName[],
      score: 85
    },
    '日月并明': {
      description: '太阳太阴同宫或对宫',
      stars: ['太阳', '太阴'] as readonly StarName[],
      score: 80
    },
    // ... 其他吉格
  },

  // 凶格
  BAD_PATTERNS: {
    '火铃格': {
      description: '火星铃星同宫',
      stars: ['火星', '铃星'] as readonly StarName[],
      score: -60
    },
    '孤寒格': {
      description: '命宫无主星照会',
      score: -50
    },
    // ... 其他凶格
  }
} as const;

// 星耀解读
export const STAR_READINGS = {
  '紫微': {
    meaning: '代表个人的尊贵、地位、权威',
    good: '紫微星有力，主贵气、有权威、受人尊重',
    bad: '紫微星陷地，易傲慢、固执，不善处理人际关系'
  },
  '天府': {
    meaning: '代表财运、福德、人缘',
    good: '天府星有力，主财运亨通、人缘好、生活富足',
    bad: '天府星失陷，易财运不稳、人际关系复杂'
  },
  // ... 其他星耀解读
} as const; 