import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { PDFDocument, EditSession } from '../types';
import toast from 'react-hot-toast';

export const usePDFEditor = () => {
  const { user, updateUser, guestEditsUsed, updateGuestEdits, maxGuestEdits } = useAuth();
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<PDFDocument | null>(null);
  const [editHistory, setEditHistory] = useState<EditSession[]>([]);

  const canEdit = useCallback(() => {
    if (user) {
      return user.isPremium || user.editsUsed < user.maxEdits;
    }
    // Guest user can edit if they haven't exceeded free limit
    return guestEditsUsed < maxGuestEdits;
  }, [user, guestEditsUsed, maxGuestEdits]);

  const consumeEdit = useCallback((editType: EditSession['editType']) => {
    if (!currentDocument) return false;

    if (!canEdit()) {
      if (user) {
        toast.error('You\'ve reached your free edit limit. Upgrade to Premium for unlimited edits!');
      } else {
        toast.error('You\'ve used all 3 free edits! Sign up to continue editing.');
      }
      return false;
    }

    if (user) {
      if (!user.isPremium) {
        updateUser({ editsUsed: user.editsUsed + 1 });
      }
    } else {
      // Update guest edits
      updateGuestEdits(guestEditsUsed + 1);
    }

    const newEdit: EditSession = {
      id: Date.now().toString(),
      documentId: currentDocument.id,
      userId: user?.id || 'guest',
      timestamp: new Date(),
      editType
    };

    setEditHistory(prev => [...prev, newEdit]);
    toast.success('Edit applied successfully!');
    return true;
  }, [user, currentDocument, canEdit, updateUser, guestEditsUsed, updateGuestEdits]);

  const uploadDocument = useCallback((file: File) => {

    const newDoc: PDFDocument = {
      id: Date.now().toString(),
      name: file.name,
      file,
      lastModified: new Date(),
      userId: user?.id || 'guest'
    };

    setDocuments(prev => [...prev, newDoc]);
    setCurrentDocument(newDoc);
    toast.success('Document uploaded successfully!');
  }, [user]);

  const getRemainingEdits = useCallback(() => {
    if (user) {
      return user.isPremium ? Infinity : user.maxEdits - user.editsUsed;
    }
    return maxGuestEdits - guestEditsUsed;
  }, [user, guestEditsUsed, maxGuestEdits]);

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