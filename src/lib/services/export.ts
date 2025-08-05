import { toPng } from 'html-to-image';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PageSpeedResults } from '../types/pagespeed';

export async function exportToPNG(): Promise<void> {
  try {
    const element = document.getElementById('results-container');
    if (!element) {
      throw new Error('Results container not found');
    }

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('PNG 내보내기에 실패했습니다.');
  }
}

export async function exportToPDF(results: PageSpeedResults): Promise<void> {
  try {
    console.log('Starting PDF export with results:', results);
    
    const pdfDoc = await PDFDocument.create();
    console.log('PDF document created');
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    console.log('Fonts embedded');
    
    // Page 1: Overview
    const page1 = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page1.getSize();
    console.log('Page 1 created with dimensions:', { width, height });
    
    // Header
    page1.drawText('MoCheck - 성능 분석 보고서', {
      x: 50,
      y: height - 60,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    
    page1.drawText(`URL: ${results.url}`, {
      x: 50,
      y: height - 90,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    page1.drawText(`분석 일시: ${results.timestamp.toLocaleString('ko-KR')}`, {
      x: 50,
      y: height - 110,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Overall Score
    page1.drawText(`종합 점수: ${results.overallScore}점`, {
      x: 50,
      y: height - 150,
      size: 20,
      font: boldFont,
      color: getScoreColor(results.overallScore)
    });
    
    // Category Scores
    let yPos = height - 200;
    const categories = [
      { label: '성능 (Performance)', score: results.scores.performance },
      { label: '접근성 (Accessibility)', score: results.scores.accessibility },
      { label: 'SEO', score: results.scores.seo },
      { label: '모범 사례 (Best Practices)', score: results.scores.bestPractices }
    ];
    
    categories.forEach(category => {
      page1.drawText(`${category.label}: ${category.score}점`, {
        x: 70,
        y: yPos,
        size: 14,
        font: font,
        color: getScoreColor(category.score)
      });
      yPos -= 30;
    });
    
    // Core Web Vitals
    yPos -= 20;
    page1.drawText('Core Web Vitals', {
      x: 50,
      y: yPos,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    
    yPos -= 30;
    const vitals = [
      { label: 'LCP (Largest Contentful Paint)', value: results.coreWebVitals.lcp.displayValue },
      { label: 'FID (First Input Delay)', value: results.coreWebVitals.fid.displayValue },
      { label: 'CLS (Cumulative Layout Shift)', value: results.coreWebVitals.cls.displayValue }
    ];
    
    vitals.forEach(vital => {
      page1.drawText(`${vital.label}: ${vital.value}`, {
        x: 70,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });
      yPos -= 25;
    });
    
    console.log('Page 1 content added');
    
    // Page 2: Detailed Audits
    const page2 = pdfDoc.addPage([595, 842]);
    page2.drawText('상세 감사 결과', {
      x: 50,
      y: height - 60,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    
    yPos = height - 100;
    const auditsByCategory = results.audits.reduce((acc, audit) => {
      if (!acc[audit.category]) acc[audit.category] = [];
      acc[audit.category].push(audit);
      return acc;
    }, {} as Record<string, typeof results.audits>);
    
    Object.entries(auditsByCategory).forEach(([category, audits]) => {
      if (yPos < 100) return; // Stop if running out of space
      
      page2.drawText(getCategoryDisplayName(category), {
        x: 50,
        y: yPos,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });
      yPos -= 25;
      
      audits.slice(0, 5).forEach(audit => {
        if (yPos < 80) return;
        
        const status = audit.score === null ? 'N/A' : 
                      audit.score >= 0.9 ? '통과' : 
                      audit.score >= 0.5 ? '경고' : '실패';
        
        page2.drawText(`• ${audit.title}: ${status}`, {
          x: 70,
          y: yPos,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPos -= 18;
      });
      yPos -= 10;
    });
    
    console.log('Page 2 content added');
    
    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated, size:', pdfBytes.length);
    
    // Create download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.pdf`;
    link.href = url;
    
    console.log('Triggering PDF download:', link.download);
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('PDF export completed successfully');
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('PDF 내보내기에 실패했습니다.');
  }
}

function getScoreColor(score: number) {
  if (score >= 90) return rgb(0, 0.6, 0);
  if (score >= 50) return rgb(0.8, 0.6, 0);
  return rgb(0.8, 0, 0);
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    performance: '성능',
    accessibility: '접근성',
    seo: 'SEO',
    'best-practices': '모범 사례',
    other: '기타'
  };
  return names[category] || category;
}

export async function exportToCSV(results: PageSpeedResults): Promise<void> {
  try {
    console.log('Starting CSV export with results:', results);
    
    const csvData = [
      // Headers
      ['URL', 'Overall Score', 'Performance', 'Accessibility', 'SEO', 'Best Practices', 'LCP', 'FID', 'CLS', 'Timestamp'],
      // Data
      [
        results.url,
        results.overallScore.toString(),
        results.scores.performance.toString(),
        results.scores.accessibility.toString(),
        results.scores.seo.toString(),
        results.scores.bestPractices.toString(),
        results.coreWebVitals.lcp.displayValue,
        results.coreWebVitals.fid.displayValue,
        results.coreWebVitals.cls.displayValue,
        new Date().toISOString()
      ]
    ];

    console.log('CSV data prepared:', csvData);

    // Add audit details
    csvData.push([]);
    csvData.push(['Audit Details']);
    csvData.push(['Title', 'Score', 'Category', 'Display Value', 'Description']);
    
    results.audits.forEach(audit => {
      csvData.push([
        audit.title,
        audit.score?.toString() || 'N/A',
        audit.category || 'other',
        audit.displayValue || '',
        audit.description
      ]);
    });

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    console.log('CSV content length:', csvContent.length);

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.csv`;
    link.href = url;
    
    console.log('Triggering download for:', link.download);
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('CSV export completed successfully');
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('CSV 내보내기에 실패했습니다.');
  }
}

export async function exportToJSON(results: PageSpeedResults): Promise<void> {
  try {
    console.log('Starting JSON export with results:', results);
    
    const jsonData = {
      ...results,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    console.log('JSON data prepared:', jsonData);

    const jsonString = JSON.stringify(jsonData, null, 2);
    console.log('JSON string length:', jsonString.length);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.json`;
    link.href = url;
    
    console.log('Triggering download for:', link.download);
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('JSON export completed successfully');
  } catch (error) {
    console.error('JSON export failed:', error);
    throw new Error('JSON 내보내기에 실패했습니다.');
  }
}
