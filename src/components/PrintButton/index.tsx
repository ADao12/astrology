import React, { useRef, useEffect } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { ChartReport } from '../ChartReport';
import type { AstroChart } from '../../core/types';
import html2canvas from 'html2canvas';

interface PrintButtonProps {
  chart: AstroChart;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ chart }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `紫微斗数命盘_${chart.birthData.year}${chart.birthData.month}${chart.birthData.day}`,
  });

  const handleExportAsImage = async () => {
    if (reportRef.current) {
      console.log('ReportRef:', reportRef.current);
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `命盘_${chart.birthData.year}${chart.birthData.month}${chart.birthData.day}.png`;
      link.click();
    }
  };

  useEffect(() => {
    if (reportRef.current) {
      console.log('ChartReport is mounted');
    }
  }, [reportRef]);

  const addWatermark = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'right';
      ctx.fillText('Watermark', canvas.width - 10, canvas.height - 10);
    }
  };

  const handleExportWithWatermark = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current);
      addWatermark(canvas);
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `命盘_${chart.birthData.year}${chart.birthData.month}${chart.birthData.day}_watermarked.png`;
      link.click();
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        icon={<PrinterOutlined />} 
        onClick={() => handlePrint()}
      >
        打印命盘
      </Button>
      <Button 
        type="default" 
        onClick={handleExportAsImage}
      >
        导出为图片
      </Button>
      <Button 
        type="default" 
        onClick={handleExportWithWatermark}
      >
        导出为带水印的图片
      </Button>
      <div style={{ display: 'none' }}>
        <ChartReport ref={reportRef} chart={chart} />
      </div>
    </>
  );
}; 