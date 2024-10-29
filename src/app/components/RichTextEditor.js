// components/RichTextEditor.js
"use client";

import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import EditorSection from './EditorSection';

const RichTextEditor = () => {
  const [pages, setPages] = useState([{
    editor1: '',
    editor2: '',
    editor3: ''
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [previewPage, setPreviewPage] = useState(0);

  const updatePreview = () => {
    requestAnimationFrame(() => {
      const previewPages = document.querySelectorAll('.preview-page');
      pages.forEach((pageContent, index) => {
        const pageElement = previewPages[index];
        if (pageElement) {
          pageElement.innerHTML = Object.values(pageContent).join('<hr class="my-4">');
        }
      });
    });
  };

  useEffect(() => {
    updatePreview();
  }, [pages]);

  const addNewPage = () => {
    setPages(prev => [...prev, {
      editor1: '',
      editor2: '',
      editor3: ''
    }]);
    setCurrentPage(pages.length);
  };

  const generateDoc = () => {
    const combinedContent = pages.map(page => 
      Object.values(page).join('<br><br>')
    ).join('<div style="page-break-after: always;"></div>');

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @font-face {
              font-family: 'Sarabun';
              src: local('Sarabun');
            }
            body {
              font-family: 'Sarabun', sans-serif;
              line-height: 1.5;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            img[style*="margin-left: auto"] {
              margin-left: auto;
            }
            img[style*="margin-right: auto"] {
              margin-right: auto;
            }
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          ${combinedContent}
        </body>
      </html>
    `;

    // สร้าง Blob ด้วย UTF-8 encoding และ BOM
    const blob = new Blob(
      [new Uint8Array([0xEF, 0xBB, 0xBF]), htmlContent], 
      { type: 'application/msword;charset=UTF-8' }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
    setPreviewPage(pageIndex);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">
          Template
        </h1>
        
        <div className="flex gap-4">
          {/* Input Section - 70% */}
          <div className="w-[70%] border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">
                แก้ไขเนื้อหา
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-2 hover:bg-gray-100 rounded text-black disabled:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-black">
                  หน้า {currentPage + 1} จาก {pages.length}
                </span>
                <button 
                  onClick={() => handlePageChange(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="p-2 hover:bg-gray-100 rounded text-black disabled:text-gray-300"
                >
                  <ChevronRight size={20} />
                </button>
                <button 
                  onClick={addNewPage}
                  className="p-2 hover:bg-gray-100 rounded text-black"
                  title="เพิ่มหน้าใหม่"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3].map((num) => (
                <EditorSection
                  key={`${currentPage}-${num}`}
                  id={`editor${num}`}
                  label={`เนื้อหาส่วนที่ ${num}`}
                  content={pages[currentPage][`editor${num}`]}
                  setContent={(content) => {
                    setPages(prev => {
                      const newPages = [...prev];
                      newPages[currentPage] = {
                        ...newPages[currentPage],
                        [`editor${num}`]: content
                      };
                      return newPages;
                    });
                  }}
                  updatePreview={updatePreview}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={generateDoc}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Download className="mr-2" size={18} />
                <span>สร้างไฟล์ Word</span>
              </button>
            </div>
          </div>

          {/* Preview Section - 30% */}
          <div className="w-[30%] border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">ตัวอย่าง</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
                  disabled={previewPage === 0}
                  className="p-1 hover:bg-gray-100 rounded text-black disabled:text-gray-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-black">
                  {previewPage + 1}/{pages.length}
                </span>
                <button 
                  onClick={() => setPreviewPage(Math.min(pages.length - 1, previewPage + 1))}
                  disabled={previewPage === pages.length - 1}
                  className="p-1 hover:bg-gray-100 rounded text-black disabled:text-gray-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="relative" style={{ height: 'calc(100vh - 280px)' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                {pages.map((_, index) => (
                  <div
                    key={index}
                    className={`preview-page absolute transition-all duration-300 bg-white shadow-md`}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1.4142', // A4 aspect ratio
                      opacity: index === previewPage ? 1 : 0,
                      transform: `scale(${index === previewPage ? 1 : 0.9})`,
                      visibility: index === previewPage ? 'visible' : 'hidden',
                      padding: '20px',
                      fontSize: '8px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;