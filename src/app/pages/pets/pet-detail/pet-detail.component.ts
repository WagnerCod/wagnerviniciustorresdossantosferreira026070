import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UtilService } from '../../../core/services/util.service';
import { PetsResponse } from '../../../core/models/pets.model';
import { TutoresResponse } from '../../../core/models/tutores.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
    selector: 'app-pet-detail',
    standalone: true,
    imports: [
       SharedModule
    ],
    templateUrl: './pet-detail.component.html',
    styleUrl: './pet-detail.component.scss'
})
export class PetDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private apiService = inject(ApiService);
    private utilService = inject(UtilService);
    private destroy$ = new Subject<void>();

    pet: PetsResponse | null = null;
    tutor: TutoresResponse | null = null;
    loading = true;
    loadingTutor = false;
    petId!: number;

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.petId = +params['id'];
                if (this.petId) {
                    this.loadPetDetails();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPetDetails(): void {
        this.loading = true;
        this.apiService.getPetById(this.petId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (pet) => {
                    this.pet = pet;
                    this.loading = false;

                    // Se o pet tiver tutorId, carregar dados do tutor
                    if ((pet as any).tutorId) {
                        this.loadTutorDetails((pet as any).tutorId);
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.utilService.showError('Erro ao carregar detalhes do pet: ' + error.message);
                    this.goBack();
                }
            });
    }

    loadTutorDetails(tutorId: number): void {
        this.loadingTutor = true;
        this.apiService.getTutorById(tutorId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (tutor) => {
                    this.tutor = tutor;
                    this.loadingTutor = false;
                },
                error: (error) => {
                    this.loadingTutor = false;
                    console.error('Erro ao carregar tutor:', error);
                }
            });
    }

    getImageUrl(): string {
        if (this.pet?.foto?.url) {
            return this.pet.foto.url;
        }
        return 'https://via.placeholder.com/400x300?text=Sem+Foto';
    }

    hasPhoto(): boolean {
        return !!this.pet?.foto?.url;
    }

    goBack(): void {
        this.router.navigate(['/pets']);
    }

    editPet(): void {
        this.router.navigate(['/pets/edit', this.petId]);
    }

    deletePet(): void {
        if (confirm(`Tem certeza que deseja excluir ${this.pet?.nome}?`)) {
            this.apiService.deletePet(this.petId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.utilService.showSuccess('Pet excluído com sucesso!');
                        this.goBack();
                    },
                    error: (error) => {
                        this.utilService.showError('Erro ao excluir pet: ' + error.message);
                    }
                });
        }
    }

    formatPhone(phone: string): string {
        return this.utilService.formatPhone(phone);
    }

    formatCPF(cpf: string): string {
        return this.utilService.formatCPF(cpf);
    }

    callTutor(): void {
        if (this.tutor?.telefone) {
            window.location.href = `tel:${this.tutor.telefone}`;
        }
    }

    emailTutor(): void {
        if (this.tutor?.email) {
            window.location.href = `mailto:${this.tutor.email}`;
        }
    }
}
