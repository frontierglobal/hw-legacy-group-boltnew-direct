import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit, Settings, Trash2, Plus, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

interface ContentItem {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pages' | 'content' | 'settings'>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [newPage, setNewPage] = useState<Partial<Page>>({ title: '', slug: '', content: '' });
  const [newContent, setNewContent] = useState<Partial<ContentItem>>({ key: '', value: '' });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch pages
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select('*')
          .order('created_at', { ascending: false });

        if (pagesError) throw pagesError;
        setPages(pagesData || []);

        // Fetch content
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .order('key');

        if (contentError) throw contentError;
        setContent(contentData || []);
      } catch (err) {
        const error = err as Error;
        logger.error('Error fetching admin data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const handleSavePage = async (page: Partial<Page>) => {
    try {
      if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update({
            title: page.title,
            slug: page.slug,
            content: page.content
          })
          .eq('id', editingPage.id);

        if (error) throw error;
        
        setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...page } : p));
        setEditingPage(null);
      } else {
        const { data, error } = await supabase
          .from('pages')
          .insert([page])
          .select()
          .single();

        if (error) throw error;
        
        setPages([data, ...pages]);
        setNewPage({ title: '', slug: '', content: '' });
      }
    } catch (err) {
      const error = err as Error;
      logger.error('Error saving page:', error);
      setError('Failed to save page. Please try again.');
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPages(pages.filter(p => p.id !== id));
    } catch (err) {
      const error = err as Error;
      logger.error('Error deleting page:', error);
      setError('Failed to delete page. Please try again.');
    }
  };

  const handleSaveContent = async (item: Partial<ContentItem>) => {
    try {
      if (editingContent) {
        const { error } = await supabase
          .from('content')
          .update({ value: item.value })
          .eq('id', editingContent.id);

        if (error) throw error;
        
        setContent(content.map(c => c.id === editingContent.id ? { ...c, value: item.value || '' } : c));
        setEditingContent(null);
      } else {
        const { data, error } = await supabase
          .from('content')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        
        setContent([...content, data]);
        setNewContent({ key: '', value: '' });
      }
    } catch (err) {
      const error = err as Error;
      logger.error('Error saving content:', error);
      setError('Failed to save content. Please try again.');
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContent(content.filter(c => c.id !== id));
    } catch (err) {
      const error = err as Error;
      logger.error('Error deleting content:', error);
      setError('Failed to delete content. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pages')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5 inline-block mr-2" />
                Manage Pages
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Edit className="h-5 w-5 inline-block mr-2" />
                Edit Content
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-5 w-5 inline-block mr-2" />
                Settings
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {activeTab === 'pages' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Pages</h2>
                
                {/* Add new page form */}
                <div className="mb-8 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Page</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newPage.title}
                      onChange={e => setNewPage({ ...newPage, title: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Slug"
                      value={newPage.slug}
                      onChange={e => setNewPage({ ...newPage, slug: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="sm:col-span-2">
                      <textarea
                        placeholder="Content"
                        value={newPage.content}
                        onChange={e => setNewPage({ ...newPage, content: e.target.value })}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        onClick={() => handleSavePage(newPage)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Page
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pages list */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {pages.map(page => (
                      <li key={page.id}>
                        <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">/{page.slug}</p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                              onClick={() => setEditingPage(page)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>
                
                {/* Add new content form */}
                <div className="mb-8 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Content</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Key"
                      value={newContent.key}
                      onChange={e => setNewContent({ ...newContent, key: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Value"
                      value={newContent.value}
                      onChange={e => setNewContent({ ...newContent, value: e.target.value })}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <button
                        onClick={() => handleSaveContent(newContent)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content list */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {content.map(item => (
                      <li key={item.id}>
                        <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">{item.key}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.value}</p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                              onClick={() => setEditingContent(item)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContent(item.id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Settings functionality coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Page</h3>
              <button
                onClick={() => setEditingPage(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={editingPage.title}
                onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={editingPage.slug}
                onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <textarea
                value={editingPage.content}
                onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
                rows={8}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePage(editingPage)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Content</h3>
              <button
                onClick={() => setEditingContent(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={editingContent.key}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
              <textarea
                value={editingContent.value}
                onChange={e => setEditingContent({ ...editingContent, value: e.target.value })}
                rows={8}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveContent(editingContent)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 