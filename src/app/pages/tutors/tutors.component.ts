import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, forkJoin } from 'rxjs';
import { TutorsFacade } from '../../core/facades/tutors.facade';
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
  private tutorsFacade = inject(TutorsFacade);
  public util = inject(UtilService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  tutores: TutoresResponse[] = [];
  searchControl = new FormControl('');
  loading = signal(false);
  loadingMore = signal(false);
  hasReachedEnd = signal(false);

  totalElements = 0;
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

    this.tutorsFacade.searchTutoresByName(searchTerm, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newTutores = response.content;
          this.totalElements = response.total;
          if (newTutores.length === 0 || newTutores.length < this.pageSize) {
            this.hasReachedEnd.set(true);
          }

          // Buscar detalhes completos de cada tutor (incluindo pets)
          if (newTutores.length > 0) {
            const tutorDetailRequests = newTutores.map(tutor =>
              this.tutorsFacade.loadTutorById(tutor.id)
            );

            forkJoin(tutorDetailRequests)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (tutoresComPets) => {
                  this.tutores = [...this.tutores, ...tutoresComPets];
                  this.currentPage++;
                  this.loading.set(false);
                  this.loadingMore.set(false);
                  this.isLoadingPage = false;
                },
                error: (error) => {
                  console.error('Erro ao carregar detalhes dos tutores:', error);
                  // Em caso de erro, adiciona os tutores sem os pets
                  this.tutores = [...this.tutores, ...newTutores];
                  this.currentPage++;
                  this.loading.set(false);
                  this.loadingMore.set(false);
                  this.isLoadingPage = false;
                }
              });
          } else {
            this.loading.set(false);
            this.loadingMore.set(false);
            this.isLoadingPage = false;
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.loadingMore.set(false);
          this.isLoadingPage = false;
          this.util.showError('Erro ao carregar tutores: ' + error.message);
        }
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const threshold = 200;
    const position = window.pageYOffset + window.innerHeight;
    const height = document.documentElement.scrollHeight;

    if (position > height - threshold && !this.isLoadingPage && !this.hasReachedEnd() && !this.loading()) {
      this.loadTutores();
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  navRegisterTutor(): void {
    this.router.navigate(['/tutors/register']);
  }

  navUpdateTutor(id: number): void {
    this.router.navigate(['/tutors/update', id]);
  }


  navTutorDetail(tutorId: number): void {
    this.router.navigate(['/tutor-details', tutorId]);
  }

  getImageUrl(tutor: TutoresResponse): string {
    if (tutor.foto?.url) {
      return tutor.foto.url;
    }
    return '';
  }

  hasPhoto(tutor: TutoresResponse): boolean {
    return !!tutor.foto?.url;
  }

  formatPhone(phone: string | number): string {
    if (!phone) return 'Não informado';
    return this.util.formatPhone(phone.toString());
  }




  deleteTutors(tutors: TutoresResponse): void {
    if (confirm(`Tem certeza que deseja excluir ${tutors.nome}?`)) {
      this.tutorsFacade.deleteTutor(tutors.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.util.showSuccess('Tutor excluído com sucesso!');
            if (tutors.foto && tutors.foto.id) {
              this.tutorsFacade.deletePhoto(tutors.id, tutors.foto.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.util.showSuccess('Foto do tutor excluída com sucesso!');
                  },
                  error: (error) => {
                    this.util.showError('Erro ao excluir foto do tutor: ' + error.message);
                  }
                });
            }
            this.resetAndLoad();
          },
          error: (error) => {
            this.util.showError('Erro ao excluir pet: ' + error.message);
          }
        });
    }
  }


  navPetTutor(tutorId?: number): void {
    this.router.navigate(['/tutor-details', tutorId ? tutorId : '']);
  }
}
