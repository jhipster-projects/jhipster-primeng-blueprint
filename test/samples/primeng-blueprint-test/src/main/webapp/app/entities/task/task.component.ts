import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager } from 'ng-jhipster';
import { MessageService } from 'primeng/api';
import { ITask } from 'app/shared/model/task.model';
import { TaskService } from './task.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html'
})
export class TaskComponent implements OnInit, OnDestroy {
  tasks: ITask[];
  eventSubscriber: Subscription;

  constructor(
    protected taskService: TaskService,
    protected taskCommentService: TaskCommentService,
    protected employeeSkillService: EmployeeSkillService,
    protected messageService: MessageService,
    protected eventManager: JhiEventManager,
    protected confirmationService: ConfirmationService,
    protected translateService: TranslateService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadAllComments();
    this.loadAllEmployeeSkills();
    this.registerChangeInTasks();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  loadAll() {
    this.taskService
      .query()
      .pipe(
        filter((res: HttpResponse<ITask[]>) => res.ok),
        map((res: HttpResponse<ITask[]>) => res.body)
      )
      .subscribe(
        (res: ITask[]) => {
          this.tasks = res;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  delete(id: number) {
    this.confirmationService.confirm({
      header: this.translateService.instant('entity.delete.title'),
      message: this.translateService.instant('primengtestApp.task.delete.question', { id }),
      accept: () => {
        this.taskService.delete(id).subscribe(() => {
          this.eventManager.broadcast({
            name: 'taskListModification',
            content: 'Deleted an task'
          });
        });
      }
    });
  }

  loadAllComments() {
    this.taskCommentService.query().subscribe(res => (this.commentOptions = res.body));
  }

  loadAllEmployeeSkills() {
    this.employeeSkillService.query().subscribe(res => (this.employeeSkillOptions = res.body));
  }

  trackId(index: number, item: ITask) {
    return item.id;
  }

  registerChangeInTasks() {
    this.eventSubscriber = this.eventManager.subscribe('taskListModification', response => this.loadAll());
  }

  protected onError(errorMessage: string) {
    this.messageService.add({ severity: 'error', summary: errorMessage });
  }
}
