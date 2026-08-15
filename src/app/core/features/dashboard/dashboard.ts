import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { UserResponse } from '../../models/auth.models';
import { TaskResponse, CreateTaskRequest, UpdateTaskRequest, PRIORITY_LABELS } from '../../models/task.models';
import { flatMap } from 'rxjs';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  user: UserResponse | null = null;
  tasks: TaskResponse[] = [];
  isLoadingTasks = false;
  taskError = '';

  // Create form
  showCreateForm = false;
  isCreating = false;
  newTask: CreateTaskRequest = { title: '', description: '', priority: 1, dueDate:null};
  createError = '';


  // Edit form
  editingTaskId: number | null = null; // Which task is being edited
  isUpdating = false;
  editTask:  UpdateTaskRequest = {}; // holds the in-progress edits
  editError = '';

  priorityLabels = PRIORITY_LABELS;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoadingTasks = true;
    this.taskError = '';
    
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoadingTasks = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.taskError = err.error?.message || 'Failed to load tasks.';
        this.isLoadingTasks = false;
        this.cdr.detectChanges();
      }
    });
  }
  

    // Create
  createTask(): void {
    if (!this.newTask.title.trim()) return;

    this.isCreating = true;
    this.createError = '';

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks = [task, ...this.tasks];
        // Reset form
        this.newTask = { title: '', description: '', priority: 1, dueDate: null };
        this.showCreateForm = false;
        this.isCreating = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.createError = err.error?.message || 'Failed to create task.';
        this.isCreating = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelCreate(): void {
   this.showCreateForm = false;
   this.newTask = { title: '', description: '', priority: 1, dueDate: null};
   this.createError = ''; 
  }
  

  // EDit
    startEdit(task: TaskResponse): void {
    this.editingTaskId = task.id;
    this.editError = '';
    // Pre-populate edit form with current task values
    this.editTask = {
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      isCompleted: task.isCompleted,
      // Convert ISO string to yyyy-MM-dd for the date input
      dueDate:     task.dueDate ? task.dueDate.substring(0, 10) : null
    };
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editTask = {};
    this.editError = '';
  }

  // SAVE Edit
  saveEdit(taskId: number): void {
    if (!this.editTask.title?.trim()) return;

    this.isUpdating = true;
    this.editError = '';

    this.taskService.updateTask(taskId, this.editTask).subscribe({
      next: (updated) => {
        // Replace updated task in list
        this.tasks = this.tasks.map(t => t.id === updated.id ? updated : t);
        this.editingTaskId = null;
        this.editTask = {};
        this.isUpdating = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.editError = err.error?.message || 'Failed to update task.';
        this.isUpdating = false;
        this.cdr.detectChanges();
      }
    });
  }

    // Toggle
    toggleTask(task: TaskResponse): void {
    this.taskService.toggleTask(task.id).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map(t => t.id === updated.id ? updated : t);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

    // Delete
    deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
    // request bhejni he voh service me jaayegi aur service se voh request API me jaayegi aur vahi saara execution hoga
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.taskError = err.error?.message || 'Failed to delete task.';
        this.cdr.detectChanges();
      }
    });
  }

    logout(): void {
      this.authService.logout();
      this.router.navigate(['/login']);
    }



    // Helpers 
isAdmin(): boolean { return this.user?.role === 'Admin'; }
isManager(): boolean { return this.user?.role === 'Manager' || this.isAdmin(); }

isEditing(taskId: number): boolean { return this.editingTaskId === taskId; }

getRoleBadgeClass(): string {
  switch (this.user?.role) {
    case 'Admin':   return 'badge-admin';
    case 'Manager': return 'badge-manager';
    default:        return 'badge-user';
  }
}

getPriorityClass(priority: number): string {
  switch (priority) {
    case 3:  return 'priority-high';
    case 2:  return 'priority-medium';
    default: return 'priority-low';
  }
}

get completedCount(): number { return this.tasks.filter(t => t.isCompleted).length; }
get pendingCount(): number { return this.tasks.filter(t => !t.isCompleted).length; }



}
