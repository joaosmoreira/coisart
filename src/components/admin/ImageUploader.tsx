import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processAndCompressImage } from '@/components/admin/AvatarUploader';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setError(null);
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const compressed = await processAndCompressImage(file, 5);
        newImages.push(compressed);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar imagem.');
      }
    }
    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleMakeMain = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[newIdx];
    next[newIdx] = temp;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-ink/80">Imagens do Artigo ({images.length})</label>
        <span className="text-[11px] text-rose font-medium">★ A 1ª imagem é a Foto Principal / Capa</span>
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

      {/* Grelha de fotos com controlos de organização */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-cream/60 rounded-2xl border border-ink/10">
          {images.map((img, idx) => (
            <div key={idx} className={`relative group rounded-2xl overflow-hidden border transition-all aspect-square bg-white shadow-sm ${idx === 0 ? 'border-2 border-rose ring-2 ring-rose/20' : 'border-ink/15'}`}>
              <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-full object-cover" />

              {/* Badge Foto Principal */}
              {idx === 0 ? (
                <span className="absolute top-2 left-2 bg-rose text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Principal
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMakeMain(idx)}
                  className="absolute top-2 left-2 bg-ink/80 hover:bg-rose text-white text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors shadow-sm flex items-center gap-1"
                >
                  <Star className="w-3 h-3" /> Tornar Capa
                </button>
              )}

              {/* Botão Eliminar */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Controlos de Ordenação (Esquerda / Direita) */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-ink/75 p-1 rounded-xl">
                <button type="button" disabled={idx === 0} onClick={() => handleMove(idx, 'left')} className="text-white hover:text-rose disabled:opacity-30 p-1"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[10px] font-bold text-white self-center">#{idx + 1}</span>
                <button type="button" disabled={idx === images.length - 1} onClick={() => handleMove(idx, 'right')} className="text-white hover:text-rose disabled:opacity-30 p-1"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zona de Drag & Drop para Fotos de Produtos */}
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
        <div className={`p-2.5 rounded-2xl ${isDragging ? 'bg-rose text-white' : 'bg-rose/10 text-rose'}`}>
          <Upload className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <p className="text-xs font-bold text-ink">
            {isDragging ? 'Solte as imagens aqui!' : 'Arraste & largue fotos aqui ou clique para selecionar'}
          </p>
          <p className="text-[11px] text-ink/50 mt-0.5">Máximo 5 MB por ficheiro (Otimização automática ativada)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex gap-2">
        <Input placeholder="Ou cole a URL de uma imagem (https://...)" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
        <Button type="button" variant="outline" onClick={handleAddUrl} className="whitespace-nowrap flex items-center gap-1">
          <ImageIcon className="w-4 h-4" /> Adicionar URL
        </Button>
      </div>
    </div>
  );
};

