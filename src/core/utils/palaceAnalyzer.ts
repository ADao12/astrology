import { PALACE_MEANINGS, STAR_NATURE, YEARLY_FORTUNE_RULES } from '../constants/palaces';
import type { AstroChart, Palace, StarName } from '../types';

export class PalaceAnalyzer {
  private chart: AstroChart;

  constructor(chart: AstroChart) {
    this.chart = chart;
  }

  private getStarNature(starName: StarName): '吉星' | '凶星' | '中性' {
    if (STAR_NATURE.吉星.includes(starName as typeof STAR_NATURE.吉星[number])) {
      return '吉星';
    }
    if (STAR_NATURE.凶星.includes(starName as typeof STAR_NATURE.凶星[number])) {
      return '凶星';
    }
    return '中性';
  }

  public analyzePalace(palace: Palace) {
    const palaceMeaning = PALACE_MEANINGS[palace.name as keyof typeof PALACE_MEANINGS];
    if (!palaceMeaning) return null;

    const stars = palace.stars;
    let analysis = {
      name: palace.name,
      meaning: palaceMeaning.meaning,
      starCount: stars.length,
      goodStars: stars.filter(s => this.getStarNature(s.name) === '吉星').length,
      badStars: stars.filter(s => this.getStarNature(s.name) === '凶星').length,
      interpretation: '',
      score: 0
    };

    // 计算宫位得分
    analysis.score = analysis.goodStars * 10 - analysis.badStars * 8;

    // 生成解读
    if (stars.length === 0) {
      analysis.interpretation = palaceMeaning.aspects.空宫;
    } else if (analysis.goodStars > analysis.badStars) {
      analysis.interpretation = palaceMeaning.aspects.吉星;
    } else {
      analysis.interpretation = palaceMeaning.aspects.凶星;
    }

    return analysis;
  }

  public calculateYearlyFortune(year: number): {
    score: number;
    description: string;
  } {
    if (!this.chart.birthYear) {
      throw new Error('Birth year is not available in the chart data');
    }

    const age = year - this.chart.birthYear;
    const bigLimit = Math.floor(age / YEARLY_FORTUNE_RULES.大限.range);
    
    let score = 0;
    let descriptions: string[] = [];

    // 计算大限影响
    const bigLimitPalace = this.chart.palaces[bigLimit % 12];
    const bigLimitStars = bigLimitPalace.stars;
    
    bigLimitStars.forEach(star => {
      const nature = this.getStarNature(star.name);
      if (nature === '吉星') {
        score += YEARLY_FORTUNE_RULES.大限.scoring.吉星会照;
        descriptions.push(`大限宫位有${star.name}吉星照会`);
      } else if (nature === '凶星') {
        score += YEARLY_FORTUNE_RULES.大限.scoring.凶星冲克;
        descriptions.push(`大限宫位有${star.name}凶星冲克`);
      }
    });

    // 计算流年影响
    const yearlyPalace = this.chart.palaces[year % 12];
    yearlyPalace.stars.forEach(star => {
      const nature = this.getStarNature(star.name);
      if (nature === '吉星') {
        score += YEARLY_FORTUNE_RULES.流年.scoring.流年吉星;
        descriptions.push(`流年遇${star.name}吉星`);
      } else if (nature === '凶星') {
        score += YEARLY_FORTUNE_RULES.流年.scoring.流年凶星;
        descriptions.push(`流年遇${star.name}凶星`);
      }
    });

    return {
      score,
      description: descriptions.join('，')
    };
  }
} 