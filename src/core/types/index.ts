export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  longitude: number;
  latitude: number;
  gender: 'male' | 'female';
}

export interface Star {
  id: string;
  name: StarName;
  type: string;
  position: number;
  strength: number;
  aspects: string[];
}

export interface Palace {
  name: string;
  position: number;
  stars: Star[];
}

export interface AstroChart {
  id: string;
  birthData: BirthData;
  birthYear: number;
  palaces: Palace[];
  mainStar: StarName;
  bodyPalace: number;
}

// 星耀名称类型
export type StarName = 
  | '紫微' | '天府' | '太阳' | '太阴' | '文昌' | '文曲' | '左辅' | '右弼'  // 吉星
  | '火星' | '铃星' | '地空' | '地劫'  // 凶星
  | '贪狼' | '巨门' | '天相' | '天梁' | '七杀' | '破军';  // 中性星 

// 添加 StarReadingResult 类型定义
export interface StarReadingResult {
  star: string;
  reading: string;
}

// 添加 PatternResult 类型定义
export interface PatternResult {
  name: string;
  description: string;
  score: number;
  type: 'good' | 'bad';
} 