import { apiClient } from '@/lib/api-client';
import { AuditLogEntry } from '@/types/audit-log.types';

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export const auditLogsService = {
  getLogs: async (params?: {
    category?: string;
    severity?: string;
    result?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.severity && params.severity !== 'all') query.set('severity', params.severity);
    if (params?.result && params.result !== 'all') query.set('result', params.result);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const qs = query.toString();
    const endpoint = `/api/admin/audit-logs${qs ? '?' + qs : ''}`;
    return await apiClient.get<AuditLogsResponse>(endpoint);
  }
};