// components/EditorSection.js
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Indent, ChevronDown, Image as ImageIcon } from 'lucide-react';

const FONT_SIZES = [
  { label: 'เล็กมาก', size: '12px' },
  { label: 'เล็ก', size: '14px' },
  { label: 'ปกติ', size: '16px' },
  { label: 'ใหญ่', size: '18px' },
  { label: 'ใหญ่มาก', size: '20px' },
  { label: 'หัวข้อ', size: '24px' },
  { label: 'หัวข้อใหญ่', size: '30px' },
];

const IMAGE_SIZES = [
  { label: 'เล็ก', width: '50px', name: 'เล็ก' },
  { label: 'กลาง', width: '100px', name: 'กลาง' },
  { label: 'ใหญ่', width: '200px', name: 'ใหญ่' },
];

const EditorSection = ({ id, label, content, setContent, updatePreview }) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const draggedImageRef = useRef(null);
    const dropTargetRef = useRef(null);
    const timeoutRef = useRef(null);  // เพิ่ม timeoutRef
  
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const [showImageSizeMenu, setShowImageSizeMenu] = useState(false);
    const [selectedSize, setSelectedSize] = useState('16px');
    const [isComposing, setIsComposing] = useState(false);
    const [imageSize, setImageSize] = useState('400px');
  
    const handleDragStart = (e) => {
        draggedImageRef.current = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      };
    
      const handleDragEnd = (e) => {
        if (draggedImageRef.current) {
          draggedImageRef.current.style.opacity = '1';
        }
        draggedImageRef.current = null;
        dropTargetRef.current = null;
    
        const images = editorRef.current.getElementsByTagName('img');
        Array.from(images).forEach(img => {
          img.style.borderTop = 'none';
          img.style.borderBottom = 'none';
        });
        handleContentChange();
      };
    
      const handleDragOver = (e) => {
        e.preventDefault();
        if (!draggedImageRef.current) return;
    
        const target = e.target;
        if (target.tagName === 'IMG' && target !== draggedImageRef.current) {
          const rect = target.getBoundingClientRect();
          const midPoint = rect.top + rect.height / 2;
    
          // Remove existing drop indicators
          const images = editorRef.current.getElementsByTagName('img');
          Array.from(images).forEach(img => {
            img.style.borderTop = 'none';
            img.style.borderBottom = 'none';
          });
    
          // Show drop indicator
          if (e.clientY < midPoint) {
            target.style.borderTop = '2px solid #2196F3';
            dropTargetRef.current = { element: target, position: 'before' };
          } else {
            target.style.borderBottom = '2px solid #2196F3';
            dropTargetRef.current = { element: target, position: 'after' };
          }
        }
      };
    
      const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedImageRef.current || !dropTargetRef.current) return;
    
        const { element, position } = dropTargetRef.current;
        if (position === 'before') {
          element.parentNode.insertBefore(draggedImageRef.current, element);
        } else {
          element.parentNode.insertBefore(draggedImageRef.current, element.nextSibling);
        }
    
        handleContentChange();
      };
    
      const alignImage = (alignment) => {
        const img = getSelectedImage();
        if (img) {
          img.style.display = 'block';
          if (alignment === 'Left') {
            img.style.marginLeft = '0';
            img.style.marginRight = 'auto';
          } else if (alignment === 'Center') {
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
          } else if (alignment === 'Right') {
            img.style.marginLeft = 'auto';
            img.style.marginRight = '0';
          }
          handleContentChange();
        } else {
          // ถ้าไม่มีรูปภาพที่เลือก ให้จัดตำแหน่งข้อความปกติ
          document.execCommand(`justify${alignment}`, false, null);
          handleContentChange();
        }
      };
    
      const insertImage = (src) => {
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = imageSize;
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        img.setAttribute('draggable', 'true');
        img.style.cursor = 'move';
    
        img.addEventListener('dragstart', handleDragStart);
        img.addEventListener('dragend', handleDragEnd);
        img.addEventListener('click', (e) => {
          const images = editorRef.current.getElementsByTagName('img');
          Array.from(images).forEach(img => {
            img.style.outline = 'none';
          });
          e.target.style.outline = '2px solid #2196F3';
        });
    
        editorRef.current.focus();
        const selection = document.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(img);
          range.collapse(false);
        }
        
        handleContentChange();
      };
    
      useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
    
        editor.addEventListener('dragover', handleDragOver);
        editor.addEventListener('drop', handleDrop);
    
        return () => {
          editor.removeEventListener('dragover', handleDragOver);
          editor.removeEventListener('drop', handleDrop);
        };
      }, []);

  const getSelectedImage = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const element = range.commonAncestorContainer;

    // ตรวจสอบว่าเป็นรูปภาพโดยตรงหรือไม่
    if (element.nodeName === 'IMG') return element;

    // ตรวจสอบว่ามีรูปภาพที่ถูกเลือกหรือไม่
    const selectedImage = element.querySelector('img');
    if (selectedImage) return selectedImage;

    // ตรวจสอบ parent elements
    let parent = element.parentElement;
    while (parent && parent !== editorRef.current) {
      if (parent.nodeName === 'IMG') return parent;
      const img = parent.querySelector('img');
      if (img) return img;
      parent = parent.parentElement;
    }

    // ถ้าไม่มีรูปภาพที่ถูกเลือก ให้หารูปภาพที่อยู่ใกล้ cursor
    const imgs = editorRef.current.getElementsByTagName('img');
    if (imgs.length > 0) {
      for (let img of imgs) {
        const rect = img.getBoundingClientRect();
        if (range.getBoundingClientRect().top >= rect.top && 
            range.getBoundingClientRect().bottom <= rect.bottom) {
          return img;
        }
      }
    }

    return null;
  };

  const handleImageAlignment = (alignment) => {
    const selection = window.getSelection();
    let targetImage = null;

    // ตรวจสอบว่ามีการเลือกรูปภาพหรือไม่
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer;
      
      // ค้นหารูปภาพที่ถูกเลือก
      if (element.nodeType === 1 && element.tagName === 'IMG') {
        targetImage = element;
      } else if (element.nodeType === 3) {
        const parentEl = element.parentElement;
        const nearestImg = parentEl.querySelector('img');
        if (nearestImg) {
          targetImage = nearestImg;
        }
      }
    }

    // ถ้าไม่มีการเลือกรูปภาพ ให้ดูว่า cursor อยู่ใกล้รูปภาพไหม
    if (!targetImage) {
      const imgs = editorRef.current.getElementsByTagName('img');
      for (let img of imgs) {
        const rect = img.getBoundingClientRect();
        const mouseY = window.mouseY;
        if (mouseY >= rect.top && mouseY <= rect.bottom) {
          targetImage = img;
          break;
        }
      }
    }

    if (targetImage) {
      targetImage.style.display = 'block';
      if (alignment === 'Left') {
        targetImage.style.margin = '10px 0';
        targetImage.style.marginRight = 'auto';
      } else if (alignment === 'Center') {
        targetImage.style.margin = '10px auto';
      } else if (alignment === 'Right') {
        targetImage.style.margin = '10px 0';
        targetImage.style.marginLeft = 'auto';
      }
      handleContentChange();
    } else {
      // ถ้าไม่มีรูปภาพที่เลือก ให้จัดตำแหน่งข้อความปกติ
      document.execCommand(`justify${alignment}`, false, null);
    }
  };

  // เพิ่ม event listener สำหรับติดตามตำแหน่งเมาส์
  useEffect(() => {
    const handleMouseMove = (e) => {
      window.mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = '';
  };

  const setImageSizeAndUpload = (size) => {
    setImageSize(size);
    setShowImageSizeMenu(false);
    fileInputRef.current.click();
  };

 

  const applyFormat = (format) => {
    editorRef.current.focus();
    document.execCommand(format, false, null);
    handleContentChange();
  };

  const applyAlignment = (alignment) => {
    editorRef.current.focus();
    document.execCommand(`justify${alignment}`, false, null);
    handleContentChange();
  };

  const applyIndent = () => {
    editorRef.current.focus();
    document.execCommand('indent', false, null);
    handleContentChange();
  };

  const applyFontSize = (size) => {
    editorRef.current.focus();
    document.execCommand('fontSize', false, '7');
    const selection = document.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      range.surroundContents(span);
    }
    setSelectedSize(size);
    setShowSizeMenu(false);
    handleContentChange();
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    handleContentChange();
  };

  const handleInput = () => {
    if (!isComposing) {
      handleContentChange();
    }
  };

  const handleChange = () => {
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      // ใช้ timeout เพื่อป้องกันการอัพเดทบ่อยเกินไป
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        updatePreview();
      }, 100);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="content-section border border-gray-200 rounded-lg p-4">
    <label className="block text-sm font-medium text-black mb-2">
      {label}
    </label>
      
      <div className="flex gap-2 mb-2 border-b border-gray-200 pb-2">
        {/* Font Size Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded text-black border border-gray-200"
            title="ขนาดตัวอักษร"
          >
            <span className="text-sm">ขนาด</span>
            <ChevronDown size={14} />
          </button>
          
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              {FONT_SIZES.map((font) => (
                <button
                  key={font.size}
                  onClick={() => applyFontSize(font.size)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
                  style={{ fontSize: font.size }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-r border-gray-200 mx-2" />
        
         {/* Text Formatting */}
      <button 
        onClick={() => document.execCommand('bold', false, null)}
        className="p-2 hover:bg-gray-100 rounded text-black"
        title="ตัวหนา"
      >
        <Bold size={18} />
      </button>
      <button 
        onClick={() => document.execCommand('italic', false, null)}
        className="p-2 hover:bg-gray-100 rounded text-black"
        title="ตัวเอียง"
      >
        <Italic size={18} />
      </button>

      <div className="border-r border-gray-200 mx-2" />
      
         {/* Alignment buttons */}
         <button 
          onClick={() => alignImage('Left')} 
          className="p-2 hover:bg-gray-100 rounded text-black"
          title="ชิดซ้าย"
        >
          <AlignLeft size={18} />
        </button>
        <button 
          onClick={() => alignImage('Center')} 
          className="p-2 hover:bg-gray-100 rounded text-black"
          title="กึ่งกลาง"
        >
          <AlignCenter size={18} />
        </button>
        <button 
          onClick={() => alignImage('Right')} 
          className="p-2 hover:bg-gray-100 rounded text-black"
          title="ชิดขวา"
        >
          <AlignRight size={18} />
        </button>
        {/* Indent */}
        <button 
          onClick={applyIndent} 
          className="p-2 hover:bg-gray-100 rounded text-black"
          title="ย่อหน้า"
        >
          <Indent size={18} />
        </button>

        <div className="border-r border-gray-200 mx-2" />
        
        {/* Image Upload */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => setShowImageSizeMenu(!showImageSizeMenu)}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded text-black"
            title="แทรกรูปภาพ"
          >
            <ImageIcon size={18} />
          </button>
          
          {showImageSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">เลือกขนาดรูปภาพ:</div>
              {IMAGE_SIZES.map((size) => (
                <button
                  key={size.width}
                  onClick={() => setImageSizeAndUpload(size.width)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 text-black"
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        onChange={handleChange}
        onKeyUp={handleChange}
        onKeyDown={handleChange}
        onClick={() => {
          setShowSizeMenu(false);
          setShowImageSizeMenu(false);
        }}
        onBlur={handleContentChange}
        spellCheck={false}
      />
    </div>
  );
};

export default EditorSection;