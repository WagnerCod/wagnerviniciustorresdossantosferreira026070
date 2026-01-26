import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UtilService } from '../../core/services/util.service';
import { TutoresResponse } from '../../core/models/tutores.model';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-tutors',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './tutors.component.html',
  styleUrl: './tutors.component.scss',
})
export class Tutors implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  tutores: TutoresResponse[] = [];
  searchControl = new FormControl('');
  loading = signal(false);
  loadingMore = signal(false);
  hasReachedEnd = signal(false);

  currentPage = 0;
  pageSize = 10;
  isLoadingPage = false;

  ngOnInit(): void {
    this.loadTutores();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetAndLoad();
      });
  }

  private resetAndLoad(): void {
    this.tutores = [];
    this.currentPage = 0;
    this.hasReachedEnd.set(false);
    this.loadTutores();
  }

  private loadTutores(): void {
    if (this.isLoadingPage || this.hasReachedEnd()) return;

    this.isLoadingPage = true;
    const isFirstLoad = this.currentPage === 0;

    if (isFirstLoad) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const searchTerm = this.searchControl.value?.trim() || '';

    this.apiService.searchTutoresByName(searchTerm, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newTutores = response.content;

          if (newTutores.length === 0 || newTutores.length < this.pageSize) {
            this.hasReachedEnd.set(true);
          }

          this.tutores = [...this.tutores, ...newTutores];
          this.currentPage++;
          this.loading.set(false);
          this.loadingMore.set(false);
          this.isLoadingPage = false;
        },
        error: (error) => {
          this.loading.set(false);
          this.loadingMore.set(false);
          this.isLoadingPage = false;
          this.utilService.showError('Erro ao carregar tutores: ' + error.message);
        }
      });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100; // pixels do final para começar a carregar
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

    if (atBottom && !this.isLoadingPage && !this.hasReachedEnd() && !this.loading()) {
      this.loadTutores();
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  navRegisterTutor(): void {
    this.router.navigate(['/tutors/register']);
  }

  viewTutorDetails(id: number): void {
    this.router.navigate(['/tutors', id]);
  }

  getImageUrl(tutor: TutoresResponse): string {
    if (tutor.foto?.url) {
      return tutor.foto.url;
    }
    return 'https://via.placeholder.com/200x200?text=Sem+Foto';
  }

  hasPhoto(tutor: TutoresResponse): boolean {
    return !!tutor.foto?.url;
  }

  formatPhone(phone: string | number): string {
    if (!phone) return 'Não informado';
    return this.utilService.formatPhone(phone.toString());
  }
}
