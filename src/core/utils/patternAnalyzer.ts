import { PATTERNS, STAR_READINGS } from '../constants/patterns';
import type { 
  AstroChart, 
  Palace, 
  StarName, 
  PatternResult,
  StarReadingResult 
} from '../types';
import type { Pattern } from '../types/patterns';

export class PatternAnalyzer {
  private chart: AstroChart;

  constructor(chart: AstroChart) {
    this.chart = chart;
  }

  // 检查星耀组合
  private checkStarCombination(palace: Palace, stars: readonly StarName[]): boolean {
    const palaceStarNames = palace.stars.map(s => s.name);
    return stars.every(star => palaceStarNames.includes(star));
  }

  // 检查对宫星耀
  private checkOppositeStars(stars: readonly StarName[]): boolean {
    for (let i = 0; i < this.chart.palaces.length; i++) {
      const palace = this.chart.palaces[i];
      const oppositeIndex = (i + 6) % 12;
      const oppositePalace = this.chart.palaces[oppositeIndex];
      
      const palaceStars = palace.stars.map(s => s.name);
      const oppositeStars = oppositePalace.stars.map(s => s.name);
      
      if (stars.every(star => 
        palaceStars.includes(star) || oppositeStars.includes(star)
      )) {
        return true;
      }
    }
    return false;
  }

  // 分析格局
  public analyzePatterns(): PatternResult[] {
    const patterns: PatternResult[] = [];

    // 检查吉格
    Object.entries(PATTERNS.GOOD_PATTERNS).forEach(([name, pattern]) => {
      let hasPattern = false;
      const typedPattern = pattern as Pattern;

      if (typedPattern.stars) {
        const starArray = typedPattern.stars as readonly StarName[];
        hasPattern = this.chart.palaces.some(palace =>
          this.checkStarCombination(palace, starArray)
        ) || this.checkOppositeStars(starArray);
      }

      if (typedPattern.conditions) {
        hasPattern = this.chart.palaces.some(palace =>
          palace.stars.some(star =>
            typedPattern.conditions!.every(condition =>
              star.aspects?.includes(condition)
            )
          )
        );
      }

      if (hasPattern) {
        patterns.push({
          name,
          description: typedPattern.description,
          score: typedPattern.score,
          type: 'good'
        });
      }
    });

    // 检查凶格
    Object.entries(PATTERNS.BAD_PATTERNS).forEach(([name, pattern]) => {
      let hasPattern = false;
      const typedPattern = pattern as Pattern;

      if (typedPattern.stars) {
        const starArray = typedPattern.stars as readonly StarName[];
        hasPattern = this.chart.palaces.some(palace =>
          this.checkStarCombination(palace, starArray)
        );
      }

      if (name === '孤寒格') {
        const mingGong = this.chart.palaces[0];
        hasPattern = mingGong.stars.length === 0;
      }

      if (hasPattern) {
        patterns.push({
          name,
          description: typedPattern.description,
          score: typedPattern.score,
          type: 'bad'
        });
      }
    });

    return patterns;
  }

  // 生成星耀解读
  public generateStarReadings(): StarReadingResult[] {
    const readings: StarReadingResult[] = [];

    this.chart.palaces.forEach(palace => {
      palace.stars.forEach(star => {
        const starReading = STAR_READINGS[star.name as keyof typeof STAR_READINGS];
        if (starReading) {
          const isStrong = star.strength >= 80;
          readings.push({
            star: star.name,
            reading: `${starReading.meaning}。${
              isStrong ? starReading.good : starReading.bad
            }`
          });
        }
      });
    });

    return readings;
  }
} 