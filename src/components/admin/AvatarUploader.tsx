import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AvatarUploaderProps {
  avatarUrl: string;
  name: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

export function processAndCompressImage(file: File, maxSizeMB: number = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`Ficheiro demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O limite é de ${maxSizeMB}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler a imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Otimização leve para JPEG com 85% de qualidade
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  name,
  onChange,
  maxSizeMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const compressedUrl = await processAndCompressImage(file, maxSizeMB);
      onChange(compressedUrl);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-3 p-5 bg-cream/50 rounded-3xl border border-ink/10">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-ink/80 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-rose" /> Foto de Perfil do Artesão
        </label>
        <span className="text-[11px] text-ink/50 font-medium">Máx. {maxSizeMB} MB (Otimização Automática)</span>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-amber-800 hover:text-amber-950 font-bold text-sm">×</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pré-visualização do Avatar */}
        <div className="relative group">
          <ArtistAvatar avatarUrl={avatarUrl} name={name || 'Artesão'} size="xl" className="shadow-md" />
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
              title="Remover foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zona de Drag & Drop */}
        <div className="flex-1 w-full space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-rose bg-rose/10 ring-4 ring-rose/20 scale-[1.01]'
                : 'border-ink/20 bg-white hover:bg-cream hover:border-rose/50'
            }`}
          >
            <div className={`p-3 rounded-2xl ${isDragging ? 'bg-rose text-white' : 'bg-rose/10 text-rose'}`}>
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">
                {isDragging ? 'Solte a imagem para carregar!' : 'Arraste & largue a foto aqui'}
              </p>
              <p className="text-[11px] text-ink/60 mt-0.5">ou clique para selecionar do computador</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-rose font-bold hover:underline text-[11px]"
            >
              {showUrlInput ? 'Ocultar introdução por URL' : 'Ou colar URL de imagem...'}
            </button>

            {avatarUrl && (
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Foto Carregada
              </span>
            )}
          </div>

          {showUrlInput && (
            <div className="flex gap-2 pt-1 animate-fadeIn">
              <Input
                placeholder="https://exemplo.com/foto.jpg"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddUrl} className="whitespace-nowrap">
                Adicionar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
