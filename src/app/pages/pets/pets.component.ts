import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UtilService } from '../../core/services/util.service';
import { PetsResponse } from '../../core/models/pets.model';
import { LoaderPersonalized } from '../../components_utils/loader-personalized/loader-personalized';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    // LoaderPersonalized
  ],
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.scss'
})
export class Pets implements OnInit, OnDestroy {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private destroy$ = new Subject<void>();

  pets: PetsResponse[] = [];
  filteredPets: PetsResponse[] = [];
  loading = false;
  private isSearchMode = false;

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

        if (searchTerm && searchTerm.trim()) {
          this.isSearchMode = true;
          this.searchPets(searchTerm.trim());
        } else {
          this.isSearchMode = false;
          this.loadPets();
        }
      });
  }

  loadPets(): void {
    if (this.loading || this.isSearchMode) return;

    this.loading = true;

    this.apiService.getPets(this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pets = response.content;
          this.filteredPets = response.content;
          // Usar setTimeout para evitar NG0100
          setTimeout(() => {
            this.totalElements = response.totalElements;
          });
          this.loading = false;
          console.log('Pets carregados:', response);
          console.log(this.loading)
          console.log(this.filteredPets)
        },
        error: (error) => {
          this.loading = false;
          this.utilService.showError('Erro ao carregar pets: ' + error.message);
        }
      });
  }

  searchPets(nome: string): void {
    if (this.loading) return;

    this.loading = true;

    this.apiService.searchPetsByName(nome)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pets) => {
          this.filteredPets = pets;
          this.totalElements = pets.length;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.utilService.showError('Erro ao buscar pets: ' + error.message);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    if (this.loading || this.isSearchMode) return;

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPets();
  }

  clearSearch(): void {
    this.isSearchMode = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.pageIndex = 0;
    this.loadPets();
  }

  viewPetDetails(petId: number): void {
    this.router.navigate(['/pets', petId]);
  }

  navRegisterPet(): void {
    this.router.navigate(['/pets/register']);
  }

  getImageUrl(pet: PetsResponse): string {
    if (pet.foto?.url) {
      return pet.foto.url;
    }
    return 'https://via.placeholder.com/300x200?text=Sem+Foto';
  }

  hasPhoto(pet: PetsResponse): boolean {
    return !!pet.foto?.url;
  }
}
