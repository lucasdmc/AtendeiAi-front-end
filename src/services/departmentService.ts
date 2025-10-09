import { apiClient } from './api/apiClient';

export interface Department {
  _id: string;
  id: string; // Alias para _id para compatibilidade
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  institution_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  is_default?: boolean; // Campo adicional para identificar setor padrão
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  institution_id: string;
  order?: number;
  is_active?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  order?: number;
}

export interface DepartmentsResponse {
  items: Department[];
  total: number;
  hasMore: boolean;
}

export interface DepartmentsQuery {
  limit?: number;
  offset?: number;
  is_active?: boolean;
  search?: string;
  institution_id?: string;
}

class DepartmentService {
  private baseUrl = '/departments';

  // Helper para mapear _id para id
  private mapDepartmentData(department: any): Department {
    return {
      ...department,
      id: department._id
    };
  }

  // Helper para mapear array de departments
  private mapDepartmentsData(departments: any[]): Department[] {
    return departments.map(dept => this.mapDepartmentData(dept));
  }

  async getDepartments(params: DepartmentsQuery = {}): Promise<DepartmentsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.institution_id) queryParams.append('institution_id', params.institution_id);

    const response = await apiClient.get<{ success: boolean; data: DepartmentsResponse }>(
      `${this.baseUrl}?${queryParams.toString()}`
    );

    // A resposta pode ter a estrutura antiga ou nova
    const data = response.data?.data || response.data;
    return {
      items: this.mapDepartmentsData((data as any)?.items || []),
      total: (data as any)?.total || 0,
      hasMore: (data as any)?.hasMore || false
    };
  }

  async getDepartment(id: string): Promise<Department> {
    const response = await apiClient.get<{ success: boolean; data: { department: Department } }>(
      `${this.baseUrl}/${id}`
    );

    return this.mapDepartmentData((response.data as any)?.data?.department || (response.data as any)?.department);
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await apiClient.post<{ success: boolean; data: { department: Department } }>(
      this.baseUrl,
      data
    );

    return this.mapDepartmentData((response.data as any)?.data?.department || (response.data as any)?.department);
  }

  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await apiClient.put<{ success: boolean; data: { department: Department } }>(
      `${this.baseUrl}/${id}`,
      data
    );

    return this.mapDepartmentData((response.data as any)?.data?.department || (response.data as any)?.department);
  }

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateDepartmentStatus(id: string, is_active: boolean): Promise<Department> {
    const response = await apiClient.put<{ success: boolean; data: { department: Department } }>(
      `${this.baseUrl}/${id}/status`,
      { is_active }
    );

    return this.mapDepartmentData((response.data as any)?.data?.department || (response.data as any)?.department);
  }

  async reorderDepartments(departmentIds: string[], institution_id: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/reorder`, {
      departmentIds,
      institution_id
    });
  }

  // Método para criar setor padrão
  async createDefaultDepartment(institution_id: string): Promise<Department> {
    return this.createDepartment({
      name: 'Geral',
      description: 'Setor padrão da instituição',
      institution_id,
      order: 0,
      is_active: true
    });
  }
}

export const departmentService = new DepartmentService();
export default departmentService;
