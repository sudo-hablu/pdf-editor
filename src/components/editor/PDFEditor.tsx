import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ZoomIn, ZoomOut, RotateCw, Download, Type, MessageSquare, Highlighter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { PDFDocument as PDFDocumentType } from '../../types';
import { usePDFEditor } from '../../hooks/usePDFEditor';
import toast from 'react-hot-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFEditorProps {
  document: PDFDocumentType;
}

interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  page: number;
}

interface HighlightAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ document }) => {
  const { consumeEdit } = usePDFEditor();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [editMode, setEditMode] = useState<'text' | 'highlight' | 'annotation' | null>(null);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [highlights, setHighlights] = useState<HighlightAnnotation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [modifiedPdfBytes, setModifiedPdfBytes] = useState<Uint8Array | null>(null);
  
  const pageRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePageClick = useCallback((event: React.MouseEvent) => {
    if (!editMode || !pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    if (editMode === 'text') {
      if (!consumeEdit('text')) return;
      
      const newAnnotation: TextAnnotation = {
        id: Date.now().toString(),
        x,
        y,
        text: 'Click to edit text',
        fontSize: 14,
        color: '#000000',
        page: pageNumber
      };
      setTextAnnotations(prev => [...prev, newAnnotation]);
      setEditingAnnotation(newAnnotation.id);
      setEditingText(newAnnotation.text);
      setIsEditing(true);
    } else if (editMode === 'highlight') {
      if (!consumeEdit('annotation')) return;
      
      const newHighlight: HighlightAnnotation = {
        id: Date.now().toString(),
        x,
        y,
        width: 100,
        height: 20,
        page: pageNumber
      };
      setHighlights(prev => [...prev, newHighlight]);
    } else if (editMode === 'annotation') {
      if (!consumeEdit('annotation')) return;
      
      const newAnnotation: TextAnnotation = {
        id: Date.now().toString(),
        x,
        y,
        text: 'Add your note here',
        fontSize: 12,
        color: '#ff6b35',
        page: pageNumber
      };
      setTextAnnotations(prev => [...prev, newAnnotation]);
      setEditingAnnotation(newAnnotation.id);
      setEditingText(newAnnotation.text);
      setIsEditing(true);
    }
  }, [editMode, scale, pageNumber, consumeEdit]);

  const handleTextSave = () => {
    if (editingAnnotation) {
      setTextAnnotations(prev =>
        prev.map(annotation =>
          annotation.id === editingAnnotation
            ? { ...annotation, text: editingText }
            : annotation
        )
      );
    }
    setIsEditing(false);
    setEditingAnnotation(null);
    setEditingText('');
    toast.success('Text added successfully!');
  };

  const handleTextCancel = () => {
    if (editingAnnotation) {
      setTextAnnotations(prev => prev.filter(annotation => annotation.id !== editingAnnotation));
    }
    setIsEditing(false);
    setEditingAnnotation(null);
    setEditingText('');
  };

  const deleteAnnotation = (id: string) => {
    setTextAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    toast.success('Annotation deleted');
  };

  const deleteHighlight = (id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
    toast.success('Highlight removed');
  };

  const generateModifiedPDF = async () => {
    try {
      const existingPdfBytes = await document.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      
      // Add text annotations
      textAnnotations.forEach(annotation => {
        if (annotation.page <= pages.length) {
          const page = pages[annotation.page - 1];
          const { height } = page.getSize();
          
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y,
            size: annotation.fontSize,
            font: helveticaFont,
            color: rgb(
              parseInt(annotation.color.slice(1, 3), 16) / 255,
              parseInt(annotation.color.slice(3, 5), 16) / 255,
              parseInt(annotation.color.slice(5, 7), 16) / 255
            ),
          });
        }
      });
      
      // Add highlights
      highlights.forEach(highlight => {
        if (highlight.page <= pages.length) {
          const page = pages[highlight.page - 1];
          const { height } = page.getSize();
          
          page.drawRectangle({
            x: highlight.x,
            y: height - highlight.y - highlight.height,
            width: highlight.width,
            height: highlight.height,
            color: rgb(1, 1, 0),
            opacity: 0.3,
          });
        }
      });
      
      const pdfBytes = await pdfDoc.save();
      setModifiedPdfBytes(pdfBytes);
      return pdfBytes;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      return null;
    }
  };

  const handleDownload = async () => {
    const pdfBytes = await generateModifiedPDF();
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${document.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    }
  };

  const currentPageAnnotations = textAnnotations.filter(annotation => annotation.page === pageNumber);
  const currentPageHighlights = highlights.filter(highlight => highlight.page === pageNumber);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editing Tools */}
      <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <Button
          variant={editMode === 'text' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setEditMode(editMode === 'text' ? null : 'text')}
        >
          <Type className="h-4 w-4 mr-1" />
          Add Text
        </Button>
        <Button
          variant={editMode === 'annotation' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setEditMode(editMode === 'annotation' ? null : 'annotation')}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Annotate
        </Button>
        <Button
          variant={editMode === 'highlight' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setEditMode(editMode === 'highlight' ? null : 'highlight')}
        >
          <Highlighter className="h-4 w-4 mr-1" />
          Highlight
        </Button>
        {editMode && (
          <span className="text-sm text-blue-600 font-medium">
            Click on the PDF to add {editMode}
          </span>
        )}
      </div>

      <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto relative">
        <div
          ref={pageRef}
          className="relative inline-block cursor-crosshair"
          onClick={handlePageClick}
        >
          <Document
            file={modifiedPdfBytes ? new Blob([modifiedPdfBytes], { type: 'application/pdf' }) : document.file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
            />
          </Document>
          
          {/* Render text annotations */}
          {currentPageAnnotations.map(annotation => (
            <div
              key={annotation.id}
              className="absolute group"
              style={{
                left: annotation.x * scale,
                top: annotation.y * scale,
                fontSize: annotation.fontSize * scale,
                color: annotation.color,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="bg-white bg-opacity-90 px-1 rounded shadow-sm">
                {annotation.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAnnotation(annotation.id);
                }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Render highlights */}
          {currentPageHighlights.map(highlight => (
            <div
              key={highlight.id}
              className="absolute bg-yellow-300 opacity-50 group cursor-pointer"
              style={{
                left: highlight.x * scale,
                top: highlight.y * scale,
                width: highlight.width * scale,
                height: highlight.height * scale,
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteHighlight(highlight.id);
              }}
            >
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                ×
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Editing Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              placeholder="Enter your text..."
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleTextCancel}>
                Cancel
              </Button>
              <Button onClick={handleTextSave}>
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {numPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PDFEditor;