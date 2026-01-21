/**
 * @fileoverview Document Uploader component with drag-and-drop support
 * @module ui/DocumentUploader
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './DocumentUploader.css';

export interface DocumentUploaderProps {
    /** Callback when file is selected */
    onFileSelect: (file: File) => void;
    /** Callback when file is removed */
    onFileRemove?: () => void;
    /** Currently selected file */
    selectedFile?: File | null;
    /** Whether document is required */
    required?: boolean;
    /** Upload progress (0-100) */
    uploadProgress?: number;
    /** Whether upload is in progress */
    isUploading?: boolean;
    /** Error message to display */
    error?: string;
    /** Custom class name */
    className?: string;
}

/**
 * DocumentUploader component
 * @description A reusable component for uploading documents with drag-and-drop support
 * @param props - DocumentUploader properties
 * @returns DocumentUploader element
 * @example
 * <DocumentUploader
 *   onFileSelect={(file) => console.log(file)}
 *   onFileRemove={() => setFile(null)}
 *   selectedFile={file}
 *   required={true}
 *   uploadProgress={50}
 *   isUploading={true}
 * />
 */
export function DocumentUploader({
    onFileSelect,
    onFileRemove,
    selectedFile,
    required = false,
    uploadProgress = 0,
    isUploading = false,
    error,
    className = '',
}: DocumentUploaderProps) {
    const [fileError, setFileError] = useState<string>('');

    const validateFile = useCallback((file: File): string | null => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = allowedTypes.includes(file.type) || 
                           allowedExtensions.includes(fileExtension);
        
        if (!isValidType) {
            return 'סוג קובץ לא נתמך. יש להעלות PDF, JPG או PNG';
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return 'גודל הקובץ חורג מ-10MB';
        }

        return null;
    }, []);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError('');

        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors) {
                const error = rejection.errors[0];
                if (error.code === 'file-too-large') {
                    setFileError('גודל הקובץ חורג מ-10MB');
                } else if (error.code === 'file-invalid-type') {
                    setFileError('סוג קובץ לא נתמך. יש להעלות PDF, JPG או PNG');
                } else {
                    setFileError(error.message || 'שגיאה בהעלאת הקובץ');
                }
            }
            return;
        }

        // Handle accepted files
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const validationError = validateFile(file);
            
            if (validationError) {
                setFileError(validationError);
                return;
            }

            onFileSelect(file);
        }
    }, [onFileSelect, validateFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        disabled: isUploading,
    });

    const handleRemoveFile = () => {
        setFileError('');
        if (onFileRemove) {
            onFileRemove();
        }
    };

    const displayError = error || fileError;
    const showMissingFile = required && !selectedFile && !displayError;

    const classNames = ['document-uploader', className].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            <div className="document-uploader__header">
                <span>צירוף קבצים רלוונטים</span>
                {required && <span className="document-uploader__required">*</span>}
            </div>

            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`document-uploader__dropzone ${
                        isDragActive ? 'document-uploader__dropzone--active' : ''
                    } ${isUploading ? 'document-uploader__dropzone--disabled' : ''}`}
                >
                    <input {...getInputProps()} aria-label="העלאת קובץ" />
                    <UploadIcon />
                    <span className="document-uploader__dropzone-text">
                        לחץ כאן להעלאת הקובץ
                    </span>
                    <span className="document-uploader__dropzone-formats">
                        סוגי הקבצים הנתמכים: PDF / PNG / JPG
                    </span>
                </div>
            ) : (
                <div className="document-uploader__file-display">
                    <FileIcon file={selectedFile} />
                    <span className="document-uploader__file-name" title={selectedFile.name}>
                        {selectedFile.name}
                    </span>
                    {!isUploading && (
                        <button
                            type="button"
                            className="document-uploader__file-remove"
                            onClick={handleRemoveFile}
                            aria-label="הסר קובץ"
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
            )}

            {/* Upload Progress Indicator */}
            {isUploading && (
                <div className="document-uploader__progress">
                    <div className="document-uploader__progress-bar">
                        <div
                            className="document-uploader__progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="document-uploader__progress-text">
                        {uploadProgress}%
                    </span>
                </div>
            )}

            {/* Error Message */}
            {displayError && (
                <span className="document-uploader__error" role="alert">
                    {displayError}
                </span>
            )}

            {/* Missing File Warning */}
            {showMissingFile && (
                <span className="document-uploader__missing-file">
                    חסר קובץ
                </span>
            )}
        </div>
    );
}

/** Upload folder icon */
function UploadIcon() {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="document-uploader__upload-icon"
        >
            <path
                d="M40 32V36C40 38.2091 38.2091 40 36 40H12C9.79086 40 8 38.2091 8 36V32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32 16L24 8L16 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M24 8V28"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** File document icon with type-specific styling */
function FileIcon({ file }: { file: File }) {
    const fileType = file.type || '';
    const isPDF = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = fileType.startsWith('image/') || 
                   ['.jpg', '.jpeg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext));

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={`document-uploader__file-icon ${
                isPDF ? 'document-uploader__file-icon--pdf' : 
                isImage ? 'document-uploader__file-icon--image' : ''
            }`}
        >
            <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 2V8H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Close X icon */
function CloseIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

