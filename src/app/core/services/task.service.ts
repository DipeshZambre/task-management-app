import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from '../models/task.models';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';


@Injectable({
  providedIn: 'root',
})
export class TaskService {

  private apiUrl =  environment.apiUrl; 

  constructor(private http: HttpClient) {}

  // ANGULAR sirf interface provide kara raha he baaki kaam toh API me hi ho raha he,  ANGULAR call kar ha he APi ko aur API call kar rahi he Database ko 

  // GET /api/tasks - returns own tasks for User, all tasks for Manager/Admin
  // Observable observe karega aur jabhibhi jisko bhi chahiye hoga usko subscribe karna padega tabhihi data milega
  // Logic already API me implemented he toh sochne ki jarurat nahi he ki user ko sirf uske tasks aur manager/admin ko saare tasks kaise dikhenge
  getTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/tasks`);
  }

  // GET: /api/tasks/id
  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/tasks/${id}`);
  }


  // POST /api/tasks
  createTask(data: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiUrl}/tasks`, data);
  }

  // PUT: /api/tasks/id
  updateTask(id: number, data: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/tasks/${id}`, data);
  }

  // PATCH: /api/tasks/:id/toggle
  toggleTask(id: number): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/tasks/${id}/toggle`, {});
  }

  // DELETE /api/tasks/:id - Admin only
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }


}
