import React, { useState, useRef } from 'react';
import { parseCSV } from '../../lib/csv';
import type { Metric } from '../../types';
import { Upload, FileText, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface CSVUploadProps {
  onMetricsLoaded: (metrics: Metric[]) => void;
}

type UploadState = 'idle' | 'parsed' | 'error';

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

export default function CSVUpload({ onMetricsLoaded }: CSVUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [labelColumn, setLabelColumn] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMessage('Please upload a CSV file.');
      setUploadState('error');
      return;
    }

    try {
      const result = await parseCSV(file);
      setParsedData(result);
      setFileName(file.name);

      // Auto-select columns if possible
      if (result.headers.length >= 1) setLabelColumn(result.headers[0]);
      if (result.headers.length >= 2) setValueColumn(result.headers[1]);

      setUploadState('parsed');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse CSV file.');
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleApply = () => {
    if (!parsedData || !labelColumn || !valueColumn) return;

    const metrics: Metric[] = parsedData.rows
      .filter((row) => row[labelColumn]?.trim() && row[valueColumn]?.trim())
      .map((row) => ({
        id: crypto.randomUUID(),
        label: row[labelColumn].trim(),
        value: row[valueColumn].trim(),
      }));

    if (metrics.length === 0) {
      setErrorMessage('No valid rows found with the selected columns.');
      setUploadState('error');
      return;
    }

    onMetricsLoaded(metrics);
  };

  const handleReset = () => {
    setUploadState('idle');
    setParsedData(null);
    setLabelColumn('');
    setValueColumn('');
    setErrorMessage('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (uploadState === 'idle' || uploadState === 'error') {
    return (
      <div className="space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">Drop your CSV file here</p>
          <p className="text-xs text-slate-400 mt-1">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {uploadState === 'error' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  if (uploadState === 'parsed' && parsedData) {
    const previewRows = parsedData.rows.slice(0, 5);

    return (
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{fileName}</span>
            <span className="text-xs text-slate-400">({parsedData.rows.length} rows)</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Change file
          </button>
        </div>

        {/* Column mapping */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Map columns</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Metric Name column</label>
              <select
                value={labelColumn}
                onChange={(e) => setLabelColumn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select column</option>
                {parsedData.headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Value column</label>
              <select
                value={valueColumn}
                onChange={(e) => setValueColumn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select column</option>
                {parsedData.headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        {labelColumn && valueColumn && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Preview (first 5 rows)</h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">{labelColumn}</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">{valueColumn}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-700">{row[labelColumn] || '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{row[valueColumn] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error (shown when apply fails) */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={!labelColumn || !valueColumn}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4" />
          Apply Mapping
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
