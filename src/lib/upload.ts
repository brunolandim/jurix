// Utility for uploading files using presigned URLs

type PresignedUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
};

export async function uploadWithPresignedUrl(
  file: File,
  getPresignedUrl: () => Promise<PresignedUrlResponse>
): Promise<string> {
  const { uploadUrl, fileUrl } = await getPresignedUrl();

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Upload to S3 failed');
  }

  return fileUrl;
}
