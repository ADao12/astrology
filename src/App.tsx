import React, { useState } from 'react';
import { Space, Alert } from 'antd';
import { BirthForm } from './components/BirthForm';
import { AstroChartDisplay as AstroChart } from './components/AstroChart';
import { ChartReading } from './components/ChartReading';
import { PrintButton } from './components/PrintButton';
import { AstroCalculator } from './core/calculator';
import type { AstroChart as AstroChartType } from './core/types';
import './App.module.css';

export const App: React.FC = () => {
  const [chart, setChart] = useState<AstroChartType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (data: any) => {
    try {
      const calculator = new AstroCalculator();
      const newChart = calculator.generateChart(data);
      setChart(newChart);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成命盘时发生错误');
      setChart(null);
    }
  };

  return (
    <div className="container">
      <h1 className="title">紫微斗数</h1>
      <BirthForm onSubmit={handleFormSubmit} />
      
      {chart && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <PrintButton chart={chart} />
          <AstroChart data={chart} />
          <ChartReading chart={chart} />
        </Space>
      )}
      
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};
