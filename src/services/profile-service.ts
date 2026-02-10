import { Lawyer } from '@/types';
import { api } from './api';
import { uploadWithPresignedUrl } from '@/lib/upload';

type PresignedUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
};

export const profileService = {
  async uploadFile(folder: string, file: File): Promise<string> {
    return uploadWithPresignedUrl(file, async () => {
      const res = await api.post<PresignedUrlResponse>('/uploads/presigned-url', {
        folder,
        contentType: file.type,
        fileName: file.name,
      });
      
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to get presigned URL');
      }
      
      return res.data;
    });
  },

  async updateProfile(data: Partial<Lawyer>): Promise<Lawyer> {
    const res = await api.put<Lawyer>('/me', data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update profile');
    }
    return res.data;
  },
};
