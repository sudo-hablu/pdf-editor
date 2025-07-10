import React from 'react';
import { Type, MessageSquare, Image, Highlighter, Eraser, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { usePDFEditor } from '../../hooks/usePDFEditor';
import { useAuth } from '../../context/AuthContext';

const EditingTools: React.FC = () => {
  const { consumeEdit, canEdit, getRemainingEdits } = usePDFEditor();
  const { user } = useAuth();

  const tools = [
    { id: 'text', icon: Type, label: 'Add Text', editType: 'text' as const },
    { id: 'annotation', icon: MessageSquare, label: 'Annotate', editType: 'annotation' as const },
    { id: 'image', icon: Image, label: 'Add Image', editType: 'image' as const },
    { id: 'highlight', icon: Highlighter, label: 'Highlight', editType: 'text' as const },
    { id: 'eraser', icon: Eraser, label: 'Erase', editType: 'text' as const },
  ];

  const handleToolClick = (editType: 'text' | 'annotation' | 'image' | 'form') => {
    consumeEdit(editType);
  };

  const remainingEdits = getRemainingEdits();

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Editing Tools</h3>
        <div className="text-sm text-gray-600">
          {remainingEdits === Infinity ? (
            <span className="text-green-600 font-medium">Unlimited edits</span>
          ) : (
            <span className={remainingEdits > 0 ? 'text-blue-600' : 'text-red-600'}>
              {remainingEdits} edits remaining
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            size="sm"
            className="flex items-center justify-center space-x-2 h-12"
            onClick={() => handleToolClick(tool.editType)}
            disabled={!canEdit()}
          >
            <tool.icon className="h-4 w-4" />
            <span>{tool.label}</span>
          </Button>
        ))}
      </div>

      <Button className="w-full" disabled={!canEdit()}>
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>

      {!canEdit() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          {user ? (
            <p className="text-sm text-yellow-800">
              You've reached your free edit limit. 
              <Link to="/pricing" className="font-medium text-yellow-900 hover:underline ml-1">
                Upgrade to Premium
              </Link> for unlimited edits.
            </p>
          ) : (
            <div className="text-sm text-yellow-800">
              <p className="mb-2">You've used all 3 free edits!</p>
              <div className="flex space-x-2">
                <Link to="/register">
                  <Button size="sm" className="text-xs">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default EditingTools;