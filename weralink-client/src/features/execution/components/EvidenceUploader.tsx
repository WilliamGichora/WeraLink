import React, { useState, useCallback } from 'react';
import { UploadCloud, File, CheckCircle, X } from 'lucide-react';
import { useGetPresignedUrl } from '../api/execution.api';

interface UploadedFile {
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

export const EvidenceUploader = ({ assignmentId }: { assignmentId: string }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl();

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      const newFileEntry: UploadedFile = {
        name: file.name,
        progress: 0,
        status: 'uploading'
      };
      
      setFiles(prev => [...prev, newFileEntry]);

      try {
        // 1. Get Presigned URL
        const { signedUploadUrl } = await getPresignedUrl({ assignmentId, fileName: file.name });
        
        // 2. Simulate Upload Progress for UX (In real app, use XMLHttpRequest or Axios with onUploadProgress)
        // For demonstration of the high-quality UI:
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: Math.min(progress, 90) } : f));
          if (progress >= 90) clearInterval(interval);
        }, 300);

        // Fetch API PUT to upload directly to Supabase bucket
        await fetch(signedUploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        clearInterval(interval);
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: 100, status: 'completed' } : f));

      } catch (error) {
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error' } : f));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <h3 className="text-xl font-bold text-accent-dark dark:text-white mb-6 font-display">Upload Evidence</h3>
      
      <div 
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-card-bg/50 dark:hover:bg-gray-750 transition-all cursor-pointer group mb-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <UploadCloud className="text-4xl text-primary w-10 h-10" />
          </div>
          <h4 className="text-lg font-semibold text-accent-dark dark:text-white mb-2">Click to upload or drag and drop</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">SVG, PNG, JPG or PDF (max. 5MB)</p>
          <input 
            type="file" 
            multiple 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <div className="space-y-4">
        {files.map((file, index) => (
          <div key={index} className="bg-background-light dark:bg-gray-750 rounded-xl p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg shrink-0 ${file.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
              {file.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <File className="w-6 h-6" />}
            </div>
            
            <div className="grow min-w-0">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-accent-dark dark:text-white truncate pr-4">{file.name}</span>
                <span className={`text-xs font-medium ${file.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                  {file.status === 'completed' ? 'Completed' : `${file.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ease-out ${file.status === 'completed' ? 'bg-green-500' : file.status === 'error' ? 'bg-red-500' : 'bg-primary'}`} 
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-accent-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors flex-shrink-0" onClick={() => setFiles(files.filter((_, i) => i !== index))}>
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
