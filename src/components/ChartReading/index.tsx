import React, { useState } from 'react';
import { Card, Collapse, Typography, Tag, Select, Space } from 'antd';
import { PatternAnalyzer } from '../../core/utils/patternAnalyzer';
import { PalaceAnalyzer } from '../../core/utils/palaceAnalyzer';
import type { AstroChart } from '../../core/types';
import type { PatternResult, StarReadingResult } from '../../core/types/patterns';
import styles from './ChartReading.module.css';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;
const { Option } = Select;

interface ChartReadingProps {
  chart: AstroChart;
}

export const ChartReading: React.FC<ChartReadingProps> = ({ chart }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const patternAnalyzer = new PatternAnalyzer(chart);
  const palaceAnalyzer = new PalaceAnalyzer(chart);
  
  const patterns = patternAnalyzer.analyzePatterns();
  const starReadings = patternAnalyzer.generateStarReadings();
  const yearlyFortune = palaceAnalyzer.calculateYearlyFortune(selectedYear);

  // 获取命宫信息
  const getMingGongInfo = () => {
    const mingGong = chart.palaces[0]; // 命宫永远是第一个宫位
    const stars = mingGong.stars.map(star => star.name).join('、');
    return `命宫位于${mingGong.name}，星耀：${stars || '无'}`;
  };

  // 获取身宫信息
  const getShenGongInfo = () => {
    const shenGong = chart.palaces.find(p => p.position === chart.bodyPalace);
    const stars = shenGong?.stars.map(star => star.name).join('、');
    return `身宫位于${shenGong?.name}，星耀：${stars || '无'}`;
  };

  // 获取主星信息
  const getMainStarInfo = () => {
    const mainStarPalace = chart.palaces.find(p => 
      p.stars.some(s => s.name === chart.mainStar)
    );
    return `主星${chart.mainStar}落在${mainStarPalace?.name}`;
  };

  // 生成年份选项（前后20年）
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 41 }, 
    (_, i) => currentYear - 20 + i
  );

  return (
    <Card title="命盘解读" className={styles.readingCard}>
      <Collapse defaultActiveKey={['basic', 'patterns', 'palaces', 'yearly']}>
        <Panel header="基本信息" key="basic">
          <Typography>
            <Title level={5}>命主信息</Title>
            <Paragraph>{getMingGongInfo()}</Paragraph>
            <Paragraph>{getShenGongInfo()}</Paragraph>
            <Paragraph>{getMainStarInfo()}</Paragraph>
          </Typography>
        </Panel>

        <Panel header="星耀分析" key="stars">
          <Typography>
            {chart.palaces.map(palace => (
              <div key={palace.position} className={styles.palaceAnalysis}>
                <Title level={5}>{palace.name}</Title>
                {palace.stars.length > 0 ? (
                  palace.stars.map(star => (
                    <Paragraph key={star.id}>
                      {star.name}：强度 {star.strength}
                      {star.aspects.length > 0 && 
                        `，四化：${star.aspects.join('、')}`
                      }
                    </Paragraph>
                  ))
                ) : (
                  <Paragraph>本宫无主星</Paragraph>
                )}
              </div>
            ))}
          </Typography>
        </Panel>

        <Panel header="格局分析" key="patterns">
          <Typography>
            <Title level={5}>命盘格局</Title>
            {patterns.map((pattern: PatternResult, index: number) => (
              <div key={index} className={styles.pattern}>
                <Tag color={pattern.type === 'good' ? 'success' : 'error'}>
                  {pattern.name}
                </Tag>
                <Paragraph>
                  {pattern.description}
                  （评分：{pattern.score}）
                </Paragraph>
              </div>
            ))}
          </Typography>
        </Panel>

        <Panel header="星耀解读" key="starReadings">
          <Typography>
            {starReadings.map((item: StarReadingResult, index: number) => (
              <div key={index} className={styles.starReading}>
                <Title level={5}>{item.star}</Title>
                <Paragraph>{item.reading}</Paragraph>
              </div>
            ))}
          </Typography>
        </Panel>

        <Panel header="宫位解读" key="palaces">
          <Typography>
            {chart.palaces.map((palace, index) => {
              const analysis = palaceAnalyzer.analyzePalace(palace);
              if (!analysis) return null;
              
              return (
                <div key={index} className={styles.palaceAnalysis}>
                  <Title level={5}>{analysis.name}</Title>
                  <Paragraph>
                    <strong>含义：</strong>{analysis.meaning}
                  </Paragraph>
                  <Paragraph>
                    <Space>
                      <Tag color="blue">吉星：{analysis.goodStars}</Tag>
                      <Tag color="red">凶星：{analysis.badStars}</Tag>
                      <Tag color="green">得分：{analysis.score}</Tag>
                    </Space>
                  </Paragraph>
                  <Paragraph>{analysis.interpretation}</Paragraph>
                </div>
              );
            })}
          </Typography>
        </Panel>

        <Panel header="流年运势" key="yearly">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 120 }}
            >
              {yearOptions.map(year => (
                <Option key={year} value={year}>{year}年</Option>
              ))}
            </Select>
            
            <Typography>
              <Title level={5}>{selectedYear}年运势分析</Title>
              <Paragraph>
                <Tag color={yearlyFortune.score > 0 ? 'success' : 'error'}>
                  总评分：{yearlyFortune.score}
                </Tag>
              </Paragraph>
              <Paragraph>{yearlyFortune.description}</Paragraph>
            </Typography>
          </Space>
        </Panel>
      </Collapse>
    </Card>
  );
}; 