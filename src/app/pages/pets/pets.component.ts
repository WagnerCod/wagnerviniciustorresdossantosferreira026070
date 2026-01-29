import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { UtilService } from '../../core/services/util.service';
import { PetsResponse } from '../../core/models/pets.model';
import { PetsFacade } from '../../core/facades/pets.facade';


@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [
    SharedModule,
  ],
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.scss'
})
export class Pets implements OnInit, OnDestroy {
  private router = inject(Router);
  private petsFacade = inject(PetsFacade);
  private utilService = inject(UtilService);
  private destroy$ = new Subject<void>();

  pets: PetsResponse[] = [];
  filteredPets: PetsResponse[] = [];
  loading = signal(false);
  loadingMore = signal(false);
  private isSearchMode = false;
  hasMorePages = signal(true);

  // Paginação
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  // Busca
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.setupSearch();
    this.loadPets();
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
      .subscribe(searchTerm => {
        this.pageIndex = 0;
        this.filteredPets = [];
        this.hasMorePages.set(true);

        if (searchTerm && searchTerm.trim()) {
          this.isSearchMode = true;
          this.searchPets(searchTerm.trim());
        } else {
          this.isSearchMode = false;
          this.loadPets();
        }
      });
  }

  loadPets(append: boolean = false): void {
    if ((this.loading() || this.loadingMore()) || this.isSearchMode || !this.hasMorePages()) return;

    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
      this.filteredPets = [];
      this.pageIndex = 0;
    }

    this.petsFacade.loadPets(this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newPets = response.content;

          if (append) {
            this.filteredPets = [...this.filteredPets, ...newPets];
          } else {
            this.filteredPets = newPets;
          }

          this.totalElements = response.total;
          this.hasMorePages.set(this.filteredPets.length < this.totalElements);

          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.loadingMore.set(false);
          this.utilService.showError('Erro ao carregar pets: ' + error.message);
        }
      });
  }

  searchPets(nome: string): void {
    if (this.loading()) return;

    this.loading.set(true);

    this.petsFacade.searchPetsByName(nome, 0, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Pets encontrados na busca:', response);

          this.filteredPets = response.content;
          this.totalElements = response.total;
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.utilService.showError('Erro ao buscar pets: ' + error.message);
        }
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const threshold = 200;
    const position = window.pageYOffset + window.innerHeight;
    const height = document.documentElement.scrollHeight;

    if (position > height - threshold && !this.loadingMore() && this.hasMorePages() && !this.isSearchMode) {
      this.pageIndex++;
      this.loadPets(true);
    }
  }

  clearSearch(): void {
    this.isSearchMode = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.pageIndex = 0;
    this.filteredPets = [];
    this.hasMorePages.set(true);
    this.loadPets();
  }

  viewPetDetails(petId: number): void {
    this.router.navigate(['/pets', petId]);
  }

  navRegisterPet(): void {
    this.router.navigate(['/pets/register']);
  }

  navTutors(): void {
    this.router.navigate(['/tutors']);
  }

  getImageUrl(pet: PetsResponse): string {
    if (pet.foto?.url) {
      return pet.foto.url;
    }
    return '';
  }

  hasPhoto(pet: PetsResponse): boolean {
    return !!pet.foto?.url;
  }
}
