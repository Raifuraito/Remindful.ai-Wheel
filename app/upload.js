import React, { useState } from 'react';
import { db } from './utils.js';

// ── FILE UPLOAD HANDLER ──────────────────────────────────────────────────────
export function FileUploadManager({ boardId, cardsFileLimit, onFileAdded, T }) {
  const [uploading, setUploading] = useState(false);
  const [boardFiles, setBoardFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Load files for this board
  React.useEffect(() => {
    (async () => {
      const files = await db.get(`board-files-${boardId}`, []);
      setBoardFiles(files);
      setLoadingFiles(false);
    })();
  }, [boardId]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    if(boardFiles.length + files.length > cardsFileLimit) {
      alert(`Max ${cardsFileLimit} files per board!`);
      return;
    }

    setUploading(true);

    for(const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          content: event.target.result, // Base64
        };

        setBoardFiles(prev => [...prev, fileData]);
        await db.set(`board-files-${boardId}`, boardFiles);
        onFileAdded?.(fileData);
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleDeleteFile = async (fileId) => {
    const updated = boardFiles.filter(f => f.id !== fileId);
    setBoardFiles(updated);
    await db.set(`board-files-${boardId}`, updated);
  };

  const handleDownloadFile = (file) => {
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    a.click();
  };

  if(loadingFiles) return <div style={{ color: T.text, fontSize: 12 }}>Loading files...</div>;

  return (
    <div style={{ marginTop: 20, padding: 16, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: T.text }}>
        📎 Board Files ({boardFiles.length}/{cardsFileLimit})
      </h4>

      {/* File Upload Input */}
      <label style={{
        display: 'block',
        padding: '12px',
        background: T.border,
        border: `2px dashed ${T.accent}`,
        borderRadius: 6,
        textAlign: 'center',
        cursor: uploading ? 'default' : 'pointer',
        color: T.text,
        marginBottom: 12,
        opacity: uploading ? 0.5 : 1,
      }}>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={uploading || boardFiles.length >= cardsFileLimit}
          style={{ display: 'none' }}
        />
        {uploading ? '⏳ Uploading...' : '📤 Click to upload files'}
      </label>

      {/* File List */}
      {boardFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {boardFiles.map(file => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
                background: T.border,
                borderRadius: 4,
                fontSize: 12,
                color: T.text,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{file.name}</div>
                <div style={{ fontSize: 10, color: '#999' }}>
                  {(file.size / 1024).toFixed(1)}KB • {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => handleDownloadFile(file)}
                  style={{
                    padding: '4px 8px',
                    background: T.accent,
                    border: 'none',
                    borderRadius: 3,
                    color: '#111',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  style={{
                    padding: '4px 8px',
                    background: '#FF6B6B',
                    border: 'none',
                    borderRadius: 3,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BOARD FILE VIEWER (Shows files in employee view) ──────────────────────────
export function BoardFilesSection({ boardId, cardsFileLimit, T }) {
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const boardFiles = await db.get(`board-files-${boardId}`, []);
      setFiles(boardFiles);
    })();
  }, [boardId]);

  if(!files.length) return null;

  return (
    <div style={{
      marginTop: 16,
      padding: 12,
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
    }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: T.text }}>
        📎 Files ({files.length})
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {files.map(file => (
          <a
            key={file.id}
            href={file.content}
            download={file.name}
            style={{
              padding: 6,
              background: T.border,
              borderRadius: 4,
              color: T.accent,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            📥 {file.name}
          </a>
        ))}
      </div>
    </div>
  );
}
