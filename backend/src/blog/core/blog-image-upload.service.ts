import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { getEnvConfig } from '../../shared/config/env-config';

/** Proxies image upload to freeimage.host so the API key stays server-side */
@Injectable()
export class BlogImageUploadService {
  public async uploadBase64(source: string): Promise<{ url: string }> {
    const key = getEnvConfig().blog.freeimageHostApiKey?.trim();
    if (!key) {
      throw new ServiceUnavailableException('Image upload is not configured (FREEIMAGE_HOST_API_KEY)');
    }

    const form = new URLSearchParams();
    form.set('key', key);
    form.set('action', 'upload');
    form.set('format', 'json');
    form.set('source', source);

    try {
      const { data } = await axios.post<{
        status_code?: number;
        image?: { url?: string; display_url?: string };
        error?: { message?: string };
      }>('https://freeimage.host/api/1/upload/', form.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 60_000,
      });

      const url = data.image?.url ?? data.image?.display_url;
      if (data.status_code !== 200 || !url) {
        throw new BadGatewayException(data.error?.message ?? 'Image upload failed');
      }

      return { url };
    } catch (e: any) {
      if (e.response?.data) {
        const msg = e.response.data?.error?.message ?? e.response.data?.status_txt;
        throw new BadGatewayException(msg ?? 'Image upload failed');
      }
      throw new BadGatewayException(e.message ?? 'Image upload failed');
    }
  }
}
