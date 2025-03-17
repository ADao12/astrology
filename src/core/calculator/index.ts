import { 
  PALACE_NAMES, 
  EARTHLY_BRANCHES, 
  HOUR_TO_BRANCH,
  ZIWEI_POSITIONS,
  TIANFU_POSITIONS,
  ZIWEI_SYSTEM_RULES,
  TIANFU_SYSTEM_RULES,
  FOUR_TRANSFORMATIONS,
  STAR_BASE_STRENGTH,
  STAR_STRENGTH_BY_PALACE
} from '../constants/astro';
import type { BirthData, AstroChart, Star, Palace, StarName } from '../types';

/* eslint-disable @typescript-eslint/no-unused-vars */
const STAR_TYPES = {
  MAIN_STARS: '主星',
  LUCKY_STARS: '吉星',
  UNLUCKY_STARS: '凶星'
} as const;
/* eslint-enable @typescript-eslint/no-unused-vars */

export class AstroCalculator {
  // 计算命宫
  private calculateMingGong(birthData: BirthData): number {
    // 获取出生时辰地支，处理小时数
    const hour = birthData.hour;
    const hourBranch = HOUR_TO_BRANCH[hour as keyof typeof HOUR_TO_BRANCH] || '子';
    
    // 获取出生月份
    const month = birthData.month;
    
    // 计算命宫位置
    const hourIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
    let mingGong = 12 - (month - 1) + hourIndex;
    
    // 确保结果在1-12之间
    while (mingGong > 12) mingGong -= 12;
    while (mingGong < 1) mingGong += 12;
    
    return mingGong;
  }

  // 计算身宫
  private calculateShenGong(mingGong: number): number {
    // 身宫计算公式：命宫宫位 + 6（超过12则减去12）
    let shenGong = mingGong + 6;
    if (shenGong > 12) shenGong -= 12;
    return shenGong;
  }

  // 初始化12宫
  private initializePalaces(): Palace[] {
    return PALACE_NAMES.map((name, index) => ({
      position: index + 1,
      name,
      stars: []
    }));
  }

  // 计算紫微星位置
  private calculateZiWeiStar(lunarDay: number): number {
    for (const [start, end, position] of ZIWEI_POSITIONS.ranges) {
      if (lunarDay >= start && lunarDay <= end) {
        return position;
      }
    }
    return 1; // 默认值
  }

  // 计算天府星位置
  private calculateTianFuStar(ziWeiPosition: number): number {
    return TIANFU_POSITIONS.offset[ziWeiPosition as keyof typeof TIANFU_POSITIONS.offset];
  }

  // 创建星耀对象
  private createStar(name: StarName, type: string, position: number): Star {
    return {
      id: `${name}-${position}`,
      name,
      type,
      position,
      strength: 100,
      aspects: []
    };
  }

  // 计算宫位偏移
  private calculateOffset(basePosition: number, offset: number): number {
    let newPosition = basePosition + offset;
    while (newPosition > 12) {
      newPosition -= 12;
    }
    return newPosition;
  }

  // 安排紫微星系
  private arrangeZiWeiSystem(ziWeiPosition: number): Star[] {
    const stars: Star[] = [];
    
    // 安紫微
    stars.push(this.createStar('紫微', 'major', ziWeiPosition));
    
    // 安其他紫微星系诸星
    Object.entries(ZIWEI_SYSTEM_RULES.offset).forEach(([starName, offset]) => {
      const position = this.calculateOffset(ziWeiPosition, offset);
      stars.push(this.createStar(starName as StarName, 'major', position));
    });
    
    return stars;
  }

  // 安排天府星系
  private arrangeTianFuSystem(tianFuPosition: number): Star[] {
    const stars: Star[] = [];
    
    // 安天府
    stars.push(this.createStar('天府', 'major', tianFuPosition));
    
    // 安其他天府星系诸星
    Object.entries(TIANFU_SYSTEM_RULES.offset).forEach(([starName, offset]) => {
      const position = this.calculateOffset(tianFuPosition, offset);
      stars.push(this.createStar(starName as StarName, 'major', position));
    });
    
    return stars;
  }

  // 获取年干
  private getYearStem(year: number): string {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const index = (year - 4) % 10;
    return stems[index];
  }

  // 计算四化
  private calculateTransformations(stars: Star[], birthYear: number): void {
    const yearStem = this.getYearStem(birthYear);
    const transformations = FOUR_TRANSFORMATIONS[yearStem as keyof typeof FOUR_TRANSFORMATIONS];
    
    if (!transformations) return;

    stars.forEach(star => {
      Object.entries(transformations).forEach(([type, targetStar]) => {
        if (star.name === targetStar) {
          star.aspects.push(type);
        }
      });
    });
  }

  // 计算星耀强度
  private calculateStarStrength(star: Star, palace: Palace): number {
    let strength = STAR_BASE_STRENGTH[star.name as keyof typeof STAR_BASE_STRENGTH] || 70;
    
    // 检查庙旺地
    const strengthRules = STAR_STRENGTH_BY_PALACE[star.name];
    if (strengthRules) {
      if (strengthRules.庙.includes(palace.position)) {
        strength += 20;
      } else if (strengthRules.旺.includes(palace.position)) {
        strength += 10;
      } else if (strengthRules.陷.includes(palace.position)) {
        strength -= 20;
      }
    }

    // 考虑四化的影响
    star.aspects.forEach(aspect => {
      switch (aspect) {
        case '化禄':
          strength += 15;
          break;
        case '化权':
          strength += 10;
          break;
        case '化科':
          strength += 10;
          break;
        case '化忌':
          strength -= 10;
          break;
      }
    });

    // 确保强度在0-100之间
    return Math.max(0, Math.min(100, strength));
  }

  // 生成命盘
  public generateChart(birthData: BirthData): AstroChart {
    // 计算命宫和身宫
    const mingGong = this.calculateMingGong(birthData);
    const shenGong = this.calculateShenGong(mingGong);
    
    // 计算紫微星位置
    const ziWeiPosition = this.calculateZiWeiStar(birthData.day);
    
    // 计算天府星位置
    const tianFuPosition = this.calculateTianFuStar(ziWeiPosition);
    
    // 安排星耀
    const ziWeiStars = this.arrangeZiWeiSystem(ziWeiPosition);
    const tianFuStars = this.arrangeTianFuSystem(tianFuPosition);
    const allStars = [...ziWeiStars, ...tianFuStars];

    // 计算四化
    this.calculateTransformations(allStars, birthData.year);

    // 初始化宫位
    const palaces = this.initializePalaces();

    // 将星耀分配到宫位并计算强度
    allStars.forEach(star => {
      const palace = palaces.find(p => p.position === star.position);
      if (palace) {
        star.strength = this.calculateStarStrength(star, palace);
        palace.stars.push(star);
      }
    });

    // 按星耀强度排序
    palaces.forEach(palace => {
      palace.stars.sort((a, b) => b.strength - a.strength);
    });

    return {
      id: Date.now().toString(),
      birthData,
      birthYear: birthData.year,
      palaces,
      mainStar: '紫微' as StarName,
      bodyPalace: shenGong
    };
  }

  // 获取宫位名称
  private getPalaceName(position: number): string {
    const palaceNames = [
      '命宫', '兄弟', '夫妻', '子女',
      '财帛', '疾厄', '迁移', '交友',
      '官禄', '田宅', '福德', '父母'
    ];
    return palaceNames[position - 1];
  }
} 