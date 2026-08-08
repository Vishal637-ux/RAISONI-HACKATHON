import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePhotoUploader = ({ currentPhotoUrl, onPhotoUploaded, onPhotoRemoved, isEditing }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid image format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Validate file size (max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('Image file size exceeds the allowed limit (2MB).');
      return;
    }

    try {
      setIsUploading(true);
      await onPhotoUploaded(file);
    } catch (err) {
      toast.error(err?.message || 'Profile photo upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      await onPhotoRemoved();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove profile photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
      {/* Reduced avatar size by 15% (w-20 h-20) */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#A874F7] bg-[#F3EDFF] flex items-center justify-center shadow-sm shrink-0">
        {currentPhotoUrl ? (
          <img src={currentPhotoUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-10 h-10 text-[#A874F7]" />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#A874F7] bg-[#F3EDFF] hover:bg-[#E9DDFE] border border-[#E9DDFE] rounded-xl transition-colors disabled:opacity-50"
            >
              <Camera size={14} />
              {currentPhotoUrl ? 'Replace Photo' : 'Upload Photo'}
            </button>

            {currentPhotoUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EF4444] bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>
          <span className="text-[11px] text-[#6B7280]">Supports JPG, PNG, WEBP (Max 2MB)</span>
        </div>
      )}
    </div>
  );
};
