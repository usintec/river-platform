import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class InternalHttpService {
  async post<T>(url: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? 'local-dev-secret',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(`Internal service returned ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Required internal service is unavailable');
    }
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? 'local-dev-secret',
        },
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(`Internal service returned ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Required internal service is unavailable');
    }
  }
}
