import React, { useState, useEffect, useRef } from 'react';
import { LessonPlanResponse } from '../types';

interface ResultDisplayProps {
   data: LessonPlanResponse;
   onReset: () => void;
}

declare global {
   interface Window {
      katex: any;
      renderMathInElement: (element: HTMLElement | null, options: any) => void;
   }
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onReset }) => {
   const [activeTab, setActiveTab] = useState<'summary' | 'methods' | 'games' | 'simulation' | 'lesson-plan' | 'lesson-plan-math'>('summary');
   const lessonPlanRef = useRef<HTMLDivElement>(null);
   const mathPlanRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const targetRef = activeTab === 'lesson-plan' ? lessonPlanRef : activeTab === 'lesson-plan-math' ? mathPlanRef : null;
      if (targetRef?.current && window.renderMathInElement) {
         setTimeout(() => {
            try {
               if (targetRef.current) {
                  window.renderMathInElement(targetRef.current, {
                     delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                     ],
                     throwOnError: false,
                     strict: false,
                     trust: true
                  });
               }
            } catch (e) {
               console.warn("KaTeX render warning:", e);
            }
         }, 100);
      }
   }, [activeTab, data]);

   const copyToClipboard = async (text: string) => {
      try {
         await navigator.clipboard.writeText(text);
         alert('Đã sao chép vào bộ nhớ tạm!');
      } catch (err) { console.error('Failed to copy:', err); }
   };

   const downloadDocx = () => {
      // Add styling to ensure LaTeX is readable and distinguishable in the Word doc
      const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
          <meta charset='utf-8'>
          <title>Phụ Lục Cải Tiến</title>
          <style>
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; } 
              .change-block { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; } 
              .type-add { background: #e6fffa; border-left: 5px solid #0d9488; } 
              .type-modify { background: #fffaf0; border-left: 5px solid #d97706; }
              /* Ensure LaTeX code is visible and not hidden by styling */
              .content { white-space: pre-wrap; }
          </style>
      </head>
      <body>
      <h1>PHỤ LỤC CẢI TIẾN GIÁO ÁN</h1>
      <p style="color: #666; font-style: italic;">
        Lưu ý: Các công thức toán học được giữ ở định dạng LaTeX (ví dụ: $x^2$) để quý thầy cô dễ dàng chuyển đổi bằng MathType hoặc tính năng Equation trong Word.
      </p>
      <hr/>`;
      const footer = "</body></html>";
      const blob = new Blob(['\ufeff', header + data.fullPlanHtml + footer], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cai_Tien_${(data.summary.topic || 'GiaoAn').replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

   const getTabClass = (tab: string) => {
      const isActive = activeTab === tab;
      return `px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-teal-50 text-teal-900 hover:bg-teal-100'}`;
   };

   return (
      <div className="flex flex-col gap-6">

         {/* Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className={getTabClass('summary')} onClick={() => setActiveTab('summary')}>📊 Tổng Quan</button>
            <button className={getTabClass('methods')} onClick={() => setActiveTab('methods')}>🎨 Phương Pháp</button>
            <button className={getTabClass('games')} onClick={() => setActiveTab('games')}>🎮 Trò Chơi</button>
            <button className={getTabClass('simulation')} onClick={() => setActiveTab('simulation')}>🔬 Mô Phỏng</button>
            {data.lessonPlanHtml && (
               <button className={getTabClass('lesson-plan-math')} onClick={() => setActiveTab('lesson-plan-math')}>📋 Kế Hoạch Dạy Học</button>
            )}
            <button className={getTabClass('lesson-plan')} onClick={() => setActiveTab('lesson-plan')}>✨ Phụ Lục</button>
         </div>

         <div className="min-h-[400px]">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                     <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">menu_book</span>
                        <div>
                           <h4 className="font-bold text-blue-900">Chủ đề bài học</h4>
                           <p className="text-blue-800 mt-1">{data.summary.topic} ({data.summary.subject})</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                     <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                        <div>
                           <h4 className="font-bold text-red-900">Điểm cần cải thiện</h4>
                           <p className="text-red-800 mt-1">{data.summary.weakness}</p>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                     <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                        <div>
                           <h4 className="font-bold text-emerald-900">Giải pháp đề xuất</h4>
                           <p className="text-emerald-800 mt-1">{data.summary.proposal}</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Methods Tab */}
            {activeTab === 'methods' && (
               <div className="flex flex-col gap-6">
                  {data.methods.map((method, idx) => (
                     <div className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm border-l-4 border-l-primary" key={idx}>
                        <h4 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                           <span className="material-symbols-outlined">layers</span> {method.name}
                        </h4>
                        <p className="text-gray-600 mb-4">{method.description}</p>
                        <div className="bg-teal-50 p-4 rounded-lg">
                           <strong className="text-teal-900 block mb-2">Các bước thực hiện:</strong>
                           <ul className="list-disc list-inside space-y-1 text-teal-800">
                              {method.steps.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                           </ul>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.games.map((game, idx) => (
                     <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" key={idx}>
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-lg font-bold text-gray-800">{game.name}</h4>
                           <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                              {game.duration}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">🎯 <strong>Mục tiêu:</strong> {game.objective}</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                              {game.steps.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                           </ol>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Simulation Tab */}
            {activeTab === 'simulation' && (
               <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  {data.simulation ? (
                     <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                           <h4 className="text-lg font-bold text-gray-800">{data.simulation.title}</h4>
                           <div className="flex gap-2">
                              <button className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors" onClick={() => copyToClipboard(data.simulation!.code)}>
                                 <span className="material-symbols-outlined text-sm">content_copy</span> Copy
                              </button>
                              <button
                                 className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                 onClick={() => {
                                    const blob = new Blob([data.simulation!.code], { type: 'text/html' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `Mo_phong_${(data.simulation!.title || 'Simulation').replace(/\s+/g, '_')}.html`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                 }}
                              >
                                 <span className="material-symbols-outlined text-sm">download</span> Tải về (.html)
                              </button>
                           </div>
                        </div>
                        <p className="text-gray-600 mb-4">{data.simulation.description}</p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                           <strong className="text-yellow-800 block mb-1 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">lightbulb</span> Hướng dẫn sử dụng:
                           </strong>
                           <ul className="list-disc list-inside text-sm text-yellow-800/90 space-y-1 ml-1">
                              <li>Cách 1: Nhấn nút <b>"Tải về (.html)"</b> ở trên và mở file vừa tải bằng trình duyệt (Chrome, Cốc Cốc, Edge...).</li>
                              <li>Cách 2: Nhấn <b>"Copy"</b>, mở ứng dụng <b>Notepad</b>, dán mã vào, lưu file với đuôi <b>.html</b> (ví dụ: <code>mophong.html</code>) rồi mở file đó.</li>
                           </ul>
                        </div>

                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[400px]">
                           <pre className="text-xs font-mono">{data.simulation.code}</pre>
                        </div>
                     </>
                  ) : (
                     <div className="text-center py-10 text-gray-400">
                        <span className="material-symbols-outlined text-5xl mb-2 opacity-50">science</span>
                        <p>Không có mô phỏng nào phù hợp cho bài học này.</p>
                     </div>
                  )}
               </div>
            )}

            {/* Math Lesson Plan Tab */}
            {activeTab === 'lesson-plan-math' && data.lessonPlanHtml && (
               <div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        <span className="material-symbols-outlined text-sm">calculate</span>
                     </div>
                     <p className="text-sm text-indigo-800">Kế hoạch dạy học Toán đổi mới được AI tạo tự động. Bạn có thể tải về và chỉnh sửa theo nhu cầu.</p>
                  </div>

                  <div ref={mathPlanRef} className="lesson-plan-container prose prose-indigo max-w-none">
                     <style>{`
                        .math-plan-container { font-family: 'Times New Roman', serif; }
                        .math-plan-container h1 { color: #1e1b4b; text-align: center; font-size: 1.3rem; margin-bottom: 0.5rem; }
                        .math-plan-container h2 { color: #312e81; font-size: 1.1rem; border-bottom: 2px solid #818cf8; padding-bottom: 4px; margin-top: 1.5rem; }
                        .math-plan-container h3 { color: #4338ca; font-size: 1rem; }
                        .math-plan-container table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
                        .math-plan-container th, .math-plan-container td { border: 1px solid #c7d2fe; padding: 8px 12px; text-align: left; }
                        .math-plan-container th { background: #e0e7ff; color: #312e81; font-weight: bold; }
                        .math-plan-container tr:nth-child(even) { background: #f5f3ff; }
                        .math-plan-container .activity { background: white; border-radius: 0.5rem; padding: 1rem; margin: 0.75rem 0; border: 1px solid #e0e7ff; border-left: 4px solid #6366f1; }
                        .math-plan-container .activity-title { color: #4338ca; font-weight: bold; font-size: 1.05rem; }
                     `}</style>
                     <div dangerouslySetInnerHTML={{ __html: data.lessonPlanHtml }} />
                  </div>

                  <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-indigo-200">
                     <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-md transition-all"
                        onClick={() => {
                           const header = `
                           <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                           <head>
                              <meta charset='utf-8'>
                              <title>Kế Hoạch Dạy Học Toán</title>
                              <style>
                                 body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
                                 h1 { text-align: center; color: #1e1b4b; }
                                 h2 { color: #312e81; border-bottom: 2px solid #818cf8; }
                                 table { width: 100%; border-collapse: collapse; }
                                 th, td { border: 1px solid #999; padding: 6px 10px; }
                                 th { background: #e0e7ff; }
                                 .activity { border-left: 4px solid #6366f1; padding: 8px 12px; margin: 8px 0; }
                              </style>
                           </head>
                           <body>`;
                           const footer = "</body></html>";
                           const blob = new Blob(['\ufeff', header + data.lessonPlanHtml! + footer], { type: 'application/msword' });
                           const url = URL.createObjectURL(blob);
                           const link = document.createElement('a');
                           link.href = url;
                           link.download = `Ke_Hoach_Day_Hoc_Toan_${(data.summary.topic || 'Bai_Day').replace(/\s+/g, '_')}.doc`;
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                           URL.revokeObjectURL(url);
                        }}
                     >
                        <span className="material-symbols-outlined">download</span> Tải Kế Hoạch Dạy Học (.doc)
                     </button>
                  </div>
               </div>
            )}

            {/* Lesson Plan Tab */}
            {activeTab === 'lesson-plan' && (
               <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">!</div>
                     <p className="text-sm text-green-800">Đây là các phần nội dung "nâng cấp". Hãy copy và dán vào giáo án gốc của bạn.</p>
                  </div>

                  {/* Styles for the inner HTML content injected by Gemini */}
                  <div ref={lessonPlanRef} className="lesson-plan-container prose prose-teal max-w-none">
                     <style>{`
                    .change-block { background: white; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
                    .change-block.type-add { border-left: 5px solid #10b981; background: #ecfdf5; }
                    .change-block.type-modify { border-left: 5px solid #f59e0b; background: #fffbeb; }
                    .change-block .location { color: #1f2937; font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; }
                    .change-block .instruction { color: #6b7280; font-style: italic; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px dashed #d1d5db; }
                `}</style>
                     <div dangerouslySetInnerHTML={{ __html: data.fullPlanHtml }} />
                  </div>

                  <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
                     <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-sm transition-colors" onClick={downloadDocx}>
                        <span className="material-symbols-outlined">download</span> Tải Phụ Lục (.doc - Có LaTeX)
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default ResultDisplay;