import { useState, useRef } from 'react';

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  value: string;
  overlay?: number;
}

const PRESET_BACKGROUNDS: BackgroundOption[] = [
  { id: 'none', name: '默认', type: 'preset', value: '' },
  { id: 'gradient-blue', name: '蓝紫星空', type: 'preset', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'gradient-sunset', name: '日落暖橙', type: 'preset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' },
  { id: 'gradient-mint', name: '薄荷清新', type: 'preset', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)' },
  { id: 'gradient-aurora', name: '极光绿', type: 'preset', value: 'linear-gradient(135deg, #0c3547 0%, #1a6b3c 40%, #0f4c75 100%)' },
  { id: 'gradient-lavender', name: '薰衣草', type: 'preset', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #f6d5f7 100%)' },
  { id: 'gradient-ocean', name: '深海蓝', type: 'preset', value: 'linear-gradient(180deg, #020024 0%, #090979 40%, #00d4ff 100%)' },
  { id: 'gradient-forest', name: '森林绿', type: 'preset', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #2d6a4f 100%)' },
  { id: 'gradient-peach', name: '蜜桃粉', type: 'preset', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)' },
  { id: 'gradient-night', name: '深夜', type: 'preset', value: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)' },
];

const STORAGE_KEY = 'lifeos_background';

export function loadBackground(): BackgroundOption | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveBackground(bg: BackgroundOption | null) {
  try {
    if (bg) localStorage.setItem(STORAGE_KEY, JSON.stringify(bg));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function compressImage(file: File, maxWidth = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  current: BackgroundOption | null;
  onSelect: (bg: BackgroundOption | null) => void;
  onClose: () => void;
}

export default function BackgroundPicker({ current, onSelect, onClose }: Props) {
  const [customImages, setCustomImages] = useState<BackgroundOption[]>(() => {
    try {
      const raw = localStorage.getItem('lifeos_custom_backgrounds');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      const custom: BackgroundOption = {
        id: 'custom-' + Date.now(),
        name: file.name.replace(/\.[^.]+$/, ''),
        type: 'custom',
        value: dataUrl,
      };
      const updated = [...customImages, custom];
      setCustomImages(updated);
      try { localStorage.setItem('lifeos_custom_backgrounds', JSON.stringify(updated)); } catch {}
      onSelect(custom);
    } catch {
      alert('图片处理失败');
    }
    e.target.value = '';
  };

  const handleRemoveCustom = (id: string) => {
    const updated = customImages.filter(c => c.id !== id);
    setCustomImages(updated);
    try { localStorage.setItem('lifeos_custom_backgrounds', JSON.stringify(updated)); } catch {}
    if (current?.id === id) onSelect(null);
  };

  const allOptions = [...PRESET_BACKGROUNDS, ...customImages];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">更换背景</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors active:text-gray-700 dark:active:text-gray-200">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {allOptions.map((bg) => {
            const isActive = current?.id === bg.id || (!current && bg.id === 'none');
            return (
              <button key={bg.id} onClick={() => onSelect(bg.id === 'none' ? null : bg)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all ${isActive ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200 dark:border-gray-700'}`}>
                {bg.value ? (
                  bg.type === 'custom' ? (
                    <img src={bg.value} alt={bg.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" style={{ background: bg.value }} />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-[12px] text-gray-400">默认</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1">
                  <span className="text-[10px] font-medium text-white">{bg.name}</span>
                </div>
                {bg.type === 'custom' && (
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveCustom(bg.id); }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </button>
            );
          })}

          {/* 上传按钮 */}
          <button onClick={() => fileRef.current?.click()}
            className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors active:border-blue-400 dark:border-gray-600">
            <div className="text-center">
              <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span className="mt-1 text-[10px] text-gray-400">自定义</span>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {current && (
          <div className="mt-4">
            <label className="mb-1 block text-[12px] font-medium text-gray-500">遮罩透明度</label>
            <input type="range" min={0} max={100} value={Math.round((current.overlay ?? 0.6) * 100)}
              onChange={(e) => onSelect({ ...current, overlay: Number(e.target.value) / 100 })}
              className="w-full accent-blue-500" />
          </div>
        )}

        <button onClick={() => onSelect(null)}
          className="mt-4 w-full rounded-xl border border-gray-300 py-2.5 text-[13px] font-medium text-gray-600 transition-colors active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">
          恢复默认
        </button>
      </div>
    </div>
  );
}
