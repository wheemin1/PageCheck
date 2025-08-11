import { toPng } from 'html-to-image';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
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
    
    // Check if results has required properties
    if (!results.url || !results.scores || !results.coreWebVitals) {
      throw new Error('분석 결과 데이터가 불완전합니다.');
    }
    
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
    
    const timestamp = results.timestamp instanceof Date 
      ? results.timestamp 
      : new Date(results.timestamp);
    
    page1.drawText(`분석 일시: ${timestamp.toLocaleString('ko-KR')}`, {
      x: 50,
      y: height - 110,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    // Calculate overall score safely
    const overallScore = results.overallScore || Math.round(
      (results.scores.performance + results.scores.accessibility + results.scores.seo + results.scores.bestPractices) / 4
    );
    
    // Overall Score
    page1.drawText(`종합 점수: ${overallScore}점`, {
      x: 50,
      y: height - 150,
      size: 20,
      font: boldFont,
      color: getScoreColor(overallScore)
    });
    
    // Category Scores
    let yPos = height - 200;
    const categories = [
      { label: '성능 (Performance)', score: results.scores.performance || 0 },
      { label: '접근성 (Accessibility)', score: results.scores.accessibility || 0 },
      { label: 'SEO', score: results.scores.seo || 0 },
      { label: '모범 사례 (Best Practices)', score: results.scores.bestPractices || 0 }
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
      { 
        label: 'LCP (Largest Contentful Paint)', 
        value: results.coreWebVitals?.lcp?.displayValue || 'N/A' 
      },
      { 
        label: 'FID (First Input Delay)', 
        value: results.coreWebVitals?.fid?.displayValue || 'N/A' 
      },
      { 
        label: 'CLS (Cumulative Layout Shift)', 
        value: results.coreWebVitals?.cls?.displayValue || 'N/A' 
      }
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
    
    // Only add page 2 if audits exist
    if (results.audits && results.audits.length > 0) {
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
    }
    
    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated, size:', pdfBytes.length);
    
    // Create download
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mocheck-results-${Date.now()}.pdf`;
    link.href = url;
    link.style.display = 'none';
    
    // Add to DOM to ensure it works in all browsers
    document.body.appendChild(link);
    
    console.log('Triggering PDF download:', link.download);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
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

export async function exportToXLSX(results: PageSpeedResults): Promise<void> {
  try {
    console.log('Starting XLSX export with results:', results);
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 1. 요약 시트
    const summaryData = [
      ['MoCheck - 성능 분석 보고서'],
      [''],
      ['분석 대상', results.url],
      ['분석 날짜', new Date().toLocaleString('ko-KR')],
      ['전략', results.strategy === 'mobile' ? '모바일' : '데스크톱'],
      [''],
      ['== 성능 점수 =='],
      ['항목', '점수', '등급'],
      ['성능', results.scores.performance, results.scores.performance >= 90 ? 'A' : results.scores.performance >= 50 ? 'B' : 'C'],
      ['접근성', results.scores.accessibility, results.scores.accessibility >= 90 ? 'A' : results.scores.accessibility >= 50 ? 'B' : 'C'],
      ['모범 사례', results.scores.bestPractices, results.scores.bestPractices >= 90 ? 'A' : results.scores.bestPractices >= 50 ? 'B' : 'C'],
      ['SEO', results.scores.seo, results.scores.seo >= 90 ? 'A' : results.scores.seo >= 50 ? 'B' : 'C']
    ];
    
    if (results.coreWebVitals) {
      summaryData.push(
        [''],
        ['== Core Web Vitals =='],
        ['지표', '값', '상태'],
        ['LCP (Largest Contentful Paint)', results.coreWebVitals.lcp?.displayValue || 'N/A', results.coreWebVitals.lcp?.score >= 0.9 ? '좋음' : results.coreWebVitals.lcp?.score >= 0.5 ? '개선 필요' : '나쁨'],
        ['FID (First Input Delay)', results.coreWebVitals.fid?.displayValue || 'N/A', results.coreWebVitals.fid?.score >= 0.9 ? '좋음' : results.coreWebVitals.fid?.score >= 0.5 ? '개선 필요' : '나쁨'],
        ['CLS (Cumulative Layout Shift)', results.coreWebVitals.cls?.displayValue || 'N/A', results.coreWebVitals.cls?.score >= 0.9 ? '좋음' : results.coreWebVitals.cls?.score >= 0.5 ? '개선 필요' : '나쁨']
      );
    }
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    
    // 요약 시트 컬럼 너비 설정
    summaryWS['!cols'] = [
      { width: 25 }, // 항목명
      { width: 15 }, // 값
      { width: 10 }  // 등급
    ];
    
    XLSX.utils.book_append_sheet(workbook, summaryWS, '요약');
    
    // 2. 감사 항목 시트 (상세)
    console.log('XLSX Export - Audits data:', results.audits?.length, results.audits?.slice(0, 3));
    
    if (results.audits && results.audits.length > 0) {
      const auditData = [
        ['MoCheck - 상세 감사 항목 보고서'],
        [''],
        ['분석 대상:', results.url],
        ['분석 시간:', new Date().toLocaleString('ko-KR')],
        ['총 감사 항목 수:', `${results.audits.length}개`],
        [''],
        ['제목', '카테고리', '점수', '표시값', '설명'],
        [''] // 헤더 구분선
      ];
      
      // 카테고리별로 그룹화 (실제 category 필드 사용)
      const auditsByCategory: { [key: string]: any[] } = {
        'performance': [],
        'accessibility': [], 
        'seo': [],
        'best-practices': [],
        'other': []
      };
      
      results.audits.forEach(audit => {
        const category = audit.category || 'other';
        if (!auditsByCategory[category]) {
          auditsByCategory[category] = [];
        }
        auditsByCategory[category].push(audit);
      });
      
      console.log('XLSX Export - Categories:', Object.keys(auditsByCategory).map(cat => `${cat}: ${auditsByCategory[cat].length}`));
      
      // 카테고리별로 정렬하여 추가
      const categoryNames: { [key: string]: string } = {
        'performance': '🚀 성능 (Performance)',
        'accessibility': '♿ 접근성 (Accessibility)', 
        'seo': '🔍 SEO',
        'best-practices': '✅ 모범 사례 (Best Practices)',
        'other': '🔧 기타 (Other)'
      };
      
      Object.entries(auditsByCategory).forEach(([category, audits]) => {
        if (audits.length > 0) {
          const categoryDisplayName = categoryNames[category] || `📋 ${category}`;
          auditData.push([categoryDisplayName], ['']); // 카테고리 헤더
          
          console.log(`XLSX Export - Processing category ${category} with ${audits.length} audits`);
          
          audits.forEach((audit: any) => {
            const scoreText = audit.score !== null ? 
              `${Math.round(audit.score * 100)}점` : 'N/A';
            const statusEmoji = audit.score !== null ?
              (audit.score >= 0.9 ? '✅' : audit.score >= 0.5 ? '⚠️' : '❌') : '➖';
              
            auditData.push([
              `${statusEmoji} ${audit.title}`,
              categoryDisplayName.replace(/🚀|♿|🔍|✅|🔧/g, '').trim(),
              scoreText,
              audit.displayValue || 'N/A',
              audit.description || '설명 없음'
            ]);
          });
          
          auditData.push(['']); // 카테고리 구분선
        }
      });
      
      const auditWS = XLSX.utils.aoa_to_sheet(auditData);
      
      // 컬럼 너비 설정
      auditWS['!cols'] = [
        { width: 40 }, // 제목
        { width: 15 }, // 카테고리
        { width: 10 }, // 점수
        { width: 15 }, // 표시값
        { width: 60 }  // 설명
      ];
      
      XLSX.utils.book_append_sheet(workbook, auditWS, '상세감사항목');
    } else {
      // audits 데이터가 없는 경우 기본 정보 시트 생성
      console.log('XLSX Export - No audits data, creating basic info sheet');
      const basicData = [
        ['감사 항목 정보 없음'],
        [''],
        ['분석 대상:', results.url],
        ['분석 시간:', new Date().toLocaleString('ko-KR')],
        [''],
        ['기본 점수 정보'],
        ['성능:', `${results.scores.performance}점`],
        ['접근성:', `${results.scores.accessibility}점`],
        ['SEO:', `${results.scores.seo}점`],
        ['모범 사례:', `${results.scores.bestPractices}점`],
        [''],
        ['참고: 상세 감사 항목은 분석 과정에서 누락되었습니다.']
      ];
      
      const basicWS = XLSX.utils.aoa_to_sheet(basicData);
      XLSX.utils.book_append_sheet(workbook, basicWS, '기본정보');
    }
    
    // 파일 다운로드
    const fileName = `mocheck-results-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    console.log('XLSX export completed successfully:', fileName);
  } catch (error) {
    console.error('XLSX export failed:', error);
    throw new Error('XLSX 내보내기에 실패했습니다.');
  }
}
