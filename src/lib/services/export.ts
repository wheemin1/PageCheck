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
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Page 1: Overview
    const page1 = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page1.getSize();
    
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
    
    const pdfBytes = await pdfDoc.save();
    
    // Create download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.pdf`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
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
