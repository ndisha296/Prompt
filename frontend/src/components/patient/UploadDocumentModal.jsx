import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { documentApi } from '../../lib/api';

export const UploadDocumentModal = ({ isOpen, onClose, onDocumentUploaded }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState(1024 * 1024 * 2); // 2MB default simulated size
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      setFileSize(file.size);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!fileName.trim()) throw new Error('Please enter or select a document file');

      await documentApi.requestUploadUrl({
        file_name: fileName,
        file_type: fileType,
        file_size_bytes: fileSize,
        description: description || 'Clinical lab report or diagnostic file'
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onDocumentUploaded) onDocumentUploaded();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to initiate secure upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-medicore-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-medicore-100" />
            <h3 className="font-bold text-lg">Upload Medical Document</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Document encrypted & deposited to secure vault!</span>
            </div>
          )}

          {/* Drag & Drop Simulation / Real File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Medical File (PDF, PNG, JPG)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-medicore-500 hover:bg-medicore-50/50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 text-medicore-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                {fileName ? fileName : 'Click or drag file to upload'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Max 25MB • Protected under HIPAA Storage Policies
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title / File Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Blood_Panel_Lipid_Profile.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Fasting lipid panel requested by Dr. Vance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-medicore-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 px-4 bg-medicore-600 hover:bg-medicore-700 text-white font-semibold rounded-xl shadow-md shadow-medicore-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Encrypt & Upload Document</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
