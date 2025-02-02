export interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  tags: string[];
  status: 'todo' | 'inProgress' | 'done';
  user_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  created_at: string;
}