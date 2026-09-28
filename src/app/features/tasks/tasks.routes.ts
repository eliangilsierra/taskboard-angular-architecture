import { Routes } from '@angular/router';
import { TasksPageComponent } from './presentation/tasks-page.component';
import { provideTasks } from './tasks.providers';

export const TASKS_ROUTES: Routes = [
  { path: '', component: TasksPageComponent, providers: [provideTasks()] }
];
