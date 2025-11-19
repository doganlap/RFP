import React, { useState, useRef } from 'react';
import { apiClient } from '../services/ApiClient';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

const DocumentUpload = ({ rfpId, onSuccess, onError }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      errors.push('Invalid file type. Allowed: PDF, Word, Excel, Text');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File too large. Max size: 50MB, Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      errors.push('File name is required');
    }

    return errors;
  };

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newErrors = {};

    fileArray.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors[file.name] = fileErrors.join(', ');
      } else {
        setFiles((prev) => {
          const exists = prev.some((f) => f.name === file.name);
          if (exists) {
            newErrors[file.name] = 'File already selected';
            return prev;
          }
          return [...prev, file];
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      if (onError) {
        onError('Some files failed validation');
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onError('Please select at least one file');
      return;
    }

    setUploading(true);
    setErrors({});
    let successCount = 0;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress tracking
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const response = await apiClient.uploadDocument(rfpId, formData);

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        successCount++;

        // Remove from list after successful upload
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [file.name]: error.message || 'Upload failed',
        }));

        if (onError) {
          onError(`Failed to upload ${file.name}`);
        }
      }
    }

    setUploading(false);

    if (successCount > 0 && onSuccess) {
      onSuccess(`Successfully uploaded ${successCount} file(s)`);
    }

    if (successCount === files.length) {
      setUploadProgress({});
    }
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Upload size={24} />
        Upload Document
      </h2>

      {/* Drag and Drop Area */}
      <div
        ref={dragRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 transition-colors cursor-pointer hover:border-blue-400 hover:bg-blue-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-semibold mb-2">Drag files here or click to select</p>
        <p className="text-sm text-gray-500 mb-2">Supported: PDF, Word, Excel, Text (Max 50MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files || [])}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          disabled={uploading}
        />
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={uploading}>
          Select Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Selected Files ({files.length})</h3>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.name} className="border border-gray-200 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 break-all">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(file.name)} className="ml-4 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={uploading}>
                    <X size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadProgress[file.name] !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress[file.name]}%` }} />
                  </div>
                )}

                {/* Error Message */}
                {errors[file.name] && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errors[file.name]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Error */}
      {Object.keys(errors).length > 0 && files.length === 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700">Please fix the errors above and try again</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => {
            setFiles([]);
            setUploadProgress({});
            setErrors({});
          }}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          disabled={uploading || files.length === 0}
        >
          Clear All
        </button>
        <button onClick={handleUpload} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2" disabled={uploading || files.length === 0}>
          {uploading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Upload Files
            </>
          )}
        </button>
      </div>

      {/* File Type Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
        <p className="font-semibold mb-2">Allowed File Types:</p>
        <p>PDF, Microsoft Word (DOC, DOCX), Excel (XLS, XLSX), Text (TXT)</p>
        <p className="mt-2">Maximum file size: 50MB</p>
      </div>
    </div>
  );
};

export default DocumentUpload;
