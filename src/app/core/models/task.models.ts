// Matches CreateTaskDto.cs
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: number;       // 1=Low, 2=Medium, 3=High
  dueDate?: string | null;
}

// Matches UpdateTaskDto.cs — all fields optional (partial update)
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: number;
  dueDate?: string | null;
}

// Matches TaskResponseDto.cs
export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  userId: number;
}

// Priority label helper — maps number to display string
export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};