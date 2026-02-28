import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CSVUploadProps {
  onUploadSuccess: () => void;
}

export function CSVUpload({ onUploadSuccess }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Map CSV headers to our schema
          const mappedData = results.data.map((row: any) => {
            // Case-insensitive matching for headers
            const findKey = (patterns: string[]) => {
              const keys = Object.keys(row);
              // Try exact match first
              for (const p of patterns) {
                const exact = keys.find(k => k.toLowerCase() === p.toLowerCase());
                if (exact) return row[exact];
              }
              // Try partial match
              const partial = keys.find(k => 
                patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))
              );
              return partial ? row[partial] : "";
            };

            return {
              username: findKey(["Username", "user"]),
              full_name: findKey(["Full Name", "name"]),
              status: findKey(["Status"]),
              package: findKey(["Package"]),
              bandwidth: findKey(["Total Bandwidth (Mbps)", "bandwidth", "mb"]),
              expiry_date: findKey(["Expiration Date", "expiry", "date"]),
              area: findKey(["Minor Area", "area", "location"]),
              address: findKey(["Address"]),
              mobile_number: findKey(["Mobile", "Phone"]),
            };
          });

          const response = await fetch("/api/upload-csv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: mappedData }),
          });

          if (response.ok) {
            setSuccess(true);
            onUploadSuccess();
            // Automatically switch to dashboard after 2 seconds
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("switch-view", { detail: "dashboard" }));
            }, 2000);
          } else {
            setError("Failed to upload data to server.");
          }
        } catch (err) {
          setError("Error processing CSV file.");
        } finally {
          setIsUploading(false);
        }
      },
      error: (err) => {
        setError("Error parsing CSV: " + err.message);
        setIsUploading(false);
      }
    });
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  } as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Upload Customer Data</h2>
          <p className="text-slate-400">Upload your ISP customer list CSV file to update the dashboard.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 p-12 transition-all"
      >
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center cursor-pointer space-y-4 ${
            isDragActive ? "border-indigo-500 bg-indigo-500/5" : ""
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {isDragActive ? "Drop the CSV here" : "Click or drag CSV file to upload"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports standard ISP customer list exports
            </p>
          </div>

          {isUploading && (
            <div className="flex items-center space-x-2 text-indigo-400 font-medium">
              <span>Processing data...</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full font-medium border border-emerald-400/20">
              <CheckCircle2 className="w-5 h-5" />
              <span>Upload successful! Dashboard updated.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-full font-medium border border-red-400/20">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-800">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-500" />
          Expected CSV Columns
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Username", "Full Name", "Status", "Package", "Bandwidth", "Expiry Date", "Area"].map((col) => (
            <div key={col} className="bg-slate-900 px-3 py-2 rounded-lg text-sm text-slate-400 border border-slate-800">
              {col}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 italic">
          * The system will automatically detect these columns even if the names are slightly different.
        </p>
      </div>
    </div>
  );
}
