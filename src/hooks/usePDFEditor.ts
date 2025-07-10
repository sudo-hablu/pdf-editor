import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { PDFDocument, EditSession } from '../types';
import toast from 'react-hot-toast';

export const usePDFEditor = () => {
  const { user, updateUser } = useAuth();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<PDFDocument | null>(null);
  const [editHistory, setEditHistory] = useState<EditSession[]>([]);

  const canEdit = useCallback(() => {
    if (!user) return false;
    return user.isPremium || user.editsUsed < user.maxEdits;
  }, [user]);

  const consumeEdit = useCallback((editType: EditSession['editType']) => {
    if (!user || !currentDocument) return false;

    if (!canEdit()) {
      toast.error('You\'ve reached your free edit limit. Upgrade to Premium for unlimited edits!');
      return false;
    }

    if (!user.isPremium) {
      updateUser({ editsUsed: user.editsUsed + 1 });
    }

    const newEdit: EditSession = {
      id: Date.now().toString(),
      documentId: currentDocument.id,
      userId: user.id,
      timestamp: new Date(),
      editType
    };

    setEditHistory(prev => [...prev, newEdit]);
    toast.success('Edit applied successfully!');
    return true;
  }, [user, currentDocument, canEdit, updateUser]);

  const uploadDocument = useCallback((file: File) => {
    if (!user) return;

    const newDoc: PDFDocument = {
      id: Date.now().toString(),
      name: file.name,
      file,
      lastModified: new Date(),
      userId: user.id
    };

    setDocuments(prev => [...prev, newDoc]);
    setCurrentDocument(newDoc);
    toast.success('Document uploaded successfully!');
  }, [user]);

  const getRemainingEdits = useCallback(() => {
    if (!user) return 0;
    return user.isPremium ? Infinity : user.maxEdits - user.editsUsed;
  }, [user]);

  return {
    documents,
    currentDocument,
    setCurrentDocument,
    editHistory,
    canEdit,
    consumeEdit,
    uploadDocument,
    getRemainingEdits
  };
};