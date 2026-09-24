import { Injectable } from '@nestjs/common';

@Injectable()
export class InternalHttpService {
  async post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? 'local-dev-secret',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? 'local-dev-secret',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
