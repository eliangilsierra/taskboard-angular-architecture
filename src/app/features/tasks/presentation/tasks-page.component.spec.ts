import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideTasks } from '../tasks.providers';
import { TasksPageComponent } from './tasks-page.component';

describe('TasksPageComponent', () => {
  let fixture: ComponentFixture<TasksPageComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [provideStore(), provideTasks()]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksPageComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function addTask(title: string): void {
    const input = element.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = title;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function titles(): string[] {
    return Array.from(element.querySelectorAll('.task-list__item span')).map(
      (span) => span.textContent ?? ''
    );
  }

  it('shows an empty state', () => {
    expect(element.textContent).toContain('Nothing to do yet.');
  });

  it('disables the add button until the title is valid', () => {
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.disabled).toBeTrue();

    const input = element.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = 'something';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(button.disabled).toBeFalse();
  });

  it('adds a task and clears the form', () => {
    addTask('buy milk');

    expect(titles()).toEqual(['buy milk']);
    expect(element.querySelector<HTMLInputElement>('input[name="title"]')!.value).toBe('');
    expect(element.textContent).toContain('1 remaining');
  });

  it('completes and removes a task', () => {
    addTask('buy milk');

    element.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    fixture.detectChanges();
    expect(element.textContent).toContain('0 remaining');

    element.querySelector<HTMLButtonElement>('.task-list__item button')!.click();
    fixture.detectChanges();
    expect(titles()).toEqual([]);
  });
});
