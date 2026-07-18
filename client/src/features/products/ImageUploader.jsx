import { useRef, useState } from 'react';
import { UploadCloud, X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { uploadImage } from '../../api/uploads.js';
import { toast } from '../../components/Toast.jsx';

export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const { url } = await uploadImage(file);
        onChange((prev) => [...prev, url]);
      } catch {
        toast(`Upload failed for ${file.name}`, 'danger');
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(index, dir) {
    onChange((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + dir, 0, item);
      return next;
    });
  }

  function remove(index) {
    onChange((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Images</p>
      <button
        type="button"
        data-testid="field-images"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          dragging ? 'border-accent bg-accent/5 text-accent' : 'border-line text-ink-soft hover:bg-surface-2'
        )}
      >
        {uploading > 0 ? (
          <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <UploadCloud className="size-5" aria-hidden="true" />
        )}
        <span>{uploading > 0 ? `Uploading ${uploading}…` : 'Drop images here or click to upload'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Upload product images"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <li key={url} className="group relative">
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="aspect-[3/4] w-full rounded-lg bg-surface-2 object-cover"
              />
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Move image left"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex size-6 items-center justify-center rounded-full bg-surface text-ink disabled:opacity-40"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move image right"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex size-6 items-center justify-center rounded-full bg-surface text-ink disabled:opacity-40"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-surface text-danger opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
