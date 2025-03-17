import React, { forwardRef } from 'react';
import { Typography, Divider, Table } from 'antd';
import type { AstroChart } from '../../core/types';
import { PatternAnalyzer } from '../../core/utils/patternAnalyzer';
import { PalaceAnalyzer } from '../../core/utils/palaceAnalyzer';
import styles from './ChartReport.module.css';

const { Title, Paragraph, Text } = Typography;

interface ChartReportProps {
  chart: AstroChart;
}

export const ChartReport = forwardRef<HTMLDivElement, ChartReportProps>(
  ({ chart }, ref) => {
    const patternAnalyzer = new PatternAnalyzer(chart);
    const palaceAnalyzer = new PalaceAnalyzer(chart);
    
    const patterns = patternAnalyzer.analyzePatterns();
    const starReadings = patternAnalyzer.generateStarReadings();
    const currentYear = new Date().getFullYear();
    const yearlyFortune = palaceAnalyzer.calculateYearlyFortune(currentYear);

    return (
      <div ref={ref} className={styles.reportContainer}>
        <div className={styles.reportHeader}>
          <Title level={2}>紫微斗数命盘报告</Title>
          <div className={styles.basicInfo}>
            <Text>阳历：{chart.birthData.year}年{chart.birthData.month}月{chart.birthData.day}日{chart.birthData.hour}时</Text>
            <Text>性别：{chart.birthData.gender === 'male' ? '男' : '女'}</Text>
          </div>
        </div>

        <Divider />

        <section className={styles.section}>
          <Title level={3}>命盘格局</Title>
          <Table 
            dataSource={patterns}
            pagination={false}
            columns={[
              {
                title: '格局',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '说明',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: '评分',
                dataIndex: 'score',
                key: 'score',
                render: (score) => (
                  <Text type={score > 0 ? 'success' : 'danger'}>
                    {score > 0 ? '+' : ''}{score}
                  </Text>
                ),
              },
            ]}
          />
        </section>

        <Divider />

        <section className={styles.section}>
          <Title level={3}>星耀解读</Title>
          {starReadings.map((item, index) => (
            <div key={index} className={styles.starReading}>
              <Title level={4}>{item.star}</Title>
              <Paragraph>{item.reading}</Paragraph>
            </div>
          ))}
        </section>

        <Divider />

        <section className={styles.section}>
          <Title level={3}>宫位分析</Title>
          <div className={styles.palaceGrid}>
            {chart.palaces.map((palace, index) => {
              const analysis = palaceAnalyzer.analyzePalace(palace);
              if (!analysis) return null;
              
              return (
                <div key={index} className={styles.palaceCard}>
                  <Title level={4}>{analysis.name}</Title>
                  <Paragraph>
                    <Text strong>星耀：</Text>
                    {palace.stars.map(star => star.name).join('、') || '无'}
                  </Paragraph>
                  <Paragraph>{analysis.interpretation}</Paragraph>
                </div>
              );
            })}
          </div>
        </section>

        <Divider />

        <section className={styles.section}>
          <Title level={3}>流年运势</Title>
          <Paragraph>
            <Text strong>当年运势评分：</Text>
            <Text type={yearlyFortune.score > 0 ? 'success' : 'danger'}>
              {yearlyFortune.score}
            </Text>
          </Paragraph>
          <Paragraph>{yearlyFortune.description}</Paragraph>
        </section>

        <footer className={styles.reportFooter}>
          <Text type="secondary">生成时间：{new Date().toLocaleString()}</Text>
        </footer>
      </div>
    );
  }
);

ChartReport.displayName = 'ChartReport'; 