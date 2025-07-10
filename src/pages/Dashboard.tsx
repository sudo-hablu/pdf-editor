import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePDFEditor } from '../hooks/usePDFEditor';
import PDFUploader from '../components/editor/PDFUploader';
import PDFViewer from '../components/editor/PDFViewer';
import EditingTools from '../components/editor/EditingTools';
import Card from '../components/ui/Card';
import { Crown, FileText, Edit, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { documents, currentDocument } = usePDFEditor();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
          <p className="text-gray-600 mt-2">Manage your PDF documents and edits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Crown className={`h-8 w-8 ${user.isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Edit className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Edits Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.isPremium ? 'Unlimited' : `${user.editsUsed}/${user.maxEdits}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentDocument ? (
              <PDFViewer document={currentDocument} />
            ) : (
              <PDFUploader />
            )}
          </div>

          <div className="space-y-6">
            <EditingTools />
            
            {/* Document List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {doc.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents yet</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;