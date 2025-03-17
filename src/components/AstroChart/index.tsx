import React from 'react';
import { Card, Divider } from 'antd';
import type { AstroChart, Star } from '../../core/types';
import styles from './AstroChart.module.css';

interface AstroChartProps {
  data: AstroChart;
}

export const AstroChartDisplay: React.FC<AstroChartProps> = ({ data }) => {
  const renderStar = (star: Star) => (
    <div 
      key={star.id}
      className={`${styles.star} ${styles[star.type]}`}
      title={`强度: ${star.strength}`}
    >
      <span>{star.name}</span>
      {star.aspects.map(aspect => (
        <span key={aspect} className={styles.aspect}>
          {aspect}
        </span>
      ))}
    </div>
  );

  return (
    <Card title="紫微命盘" className={styles.chartCard}>
      <div className={styles.chartGrid}>
        {/* 十二宫的布局 */}
        {data.palaces.map((palace) => (
          <div 
            key={palace.position} 
            className={`${styles.palace} ${palace.position === data.bodyPalace ? styles.bodyPalace : ''}`}
          >
            <div className={styles.palaceHeader}>
              {palace.name}
              {palace.position === data.bodyPalace && <span>(身宫)</span>}
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div className={styles.starList}>
              {palace.stars.map(renderStar)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}; 