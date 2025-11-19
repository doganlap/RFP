import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/ApiClient';
import { AlertCircle, Download, Trash2, Share2, Search, Filter, ChevronLeft, ChevronRight, Clock, FileText, Loader } from 'lucide-react';

const DocumentListView = ({ rfpId, onDocumentSelect }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());

  // Fetch documents
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      if (rfpId) {
        const results = await apiClient.searchDocuments(rfpId, '');
        setDocuments(Array.isArray(results) ? results : results.items || []);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort documents
  const processedDocuments = useCallback(() => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => doc.name?.toLowerCase().includes(query));
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((doc) => {
        const ext = doc.name?.split('.').pop()?.toLowerCase();
        return ext === selectedType;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'size':
          aVal = a.size || 0;
          bVal = b.size || 0;
          break;
        case 'date':
        default:
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchQuery, selectedType, sortBy, sortOrder]);

  const filtered = processedDocuments();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedDocuments = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDocuments(new Set(paginatedDocuments.map((doc) => doc.id)));
    } else {
      setSelectedDocuments(new Set());
    }
  };

  const toggleDocumentSelection = (docId) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeleting((prev) => new Set([...prev, docId]));
      await apiClient.deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      setSelectedDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    } catch (err) {
      setError(`Failed to delete document: ${err.message}`);
    } finally {
      setDeleting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      await apiClient.downloadDocument(docId, fileName);
    } catch (err) {
      setError(`Failed to download document: ${err.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentType = (fileName) => {
    if (!fileName) return 'file';
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  const getDocumentIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'txt':
        return '📋';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size={48} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText size={24} />
        Documents
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="txt">Text</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* Items per Page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedDocuments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} documents
        {selectedDocuments.size > 0 && ` (${selectedDocuments.size} selected)`}
      </div>

      {/* Table */}
      {paginatedDocuments.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">
                  <input type="checkbox" onChange={handleSelectAll} className="rounded" />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDocumentIcon(doc.name)}</span>
                      <span className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer break-all" onClick={() => onDocumentSelect?.(doc)}>
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatFileSize(doc.size)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{getDocumentType(doc.name)}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc.id, doc.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Share">
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting.has(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting.has(doc.id) ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg mb-6">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium mb-2">No documents found</p>
          <p className="text-sm text-gray-500">Upload documents to get started</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded ${
                  currentPage === page ? 'bg-blue-600 text-white font-semibold' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentListView;
