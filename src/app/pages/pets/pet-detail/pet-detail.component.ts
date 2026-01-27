import { Component, inject, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UtilService } from '../../../core/services/util.service';
import { PetsResponse } from '../../../core/models/pets.model';
import { TutoresResponse } from '../../../core/models/tutores.model';
import { SharedModule } from '../../../shared/shared.module';
import { LoaderPersonalized } from '../../../components_utils/loader-personalized/loader-personalized';

@Component({
    selector: 'app-pet-detail',
    standalone: true,
    imports: [
        SharedModule,
        LoaderPersonalized
    ],
    templateUrl: './pet-detail.component.html',
    styleUrl: './pet-detail.component.scss'
})
export class PetDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private apiService = inject(ApiService);
    utilService = inject(UtilService);
    private destroy$ = new Subject<void>();

    pet: PetsResponse | null = null;
    tutor: TutoresResponse | null = null;
    tutores: any[] = [];
    loading = signal(false);
    loadingTutor = false;
    petId!: number;

    ngOnInit(): void {
        console.log('PetDetailComponent inicializado');
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                console.log('Parâmetros da rota:', params);
                this.petId = +params['id'];
                if (this.petId && !isNaN(this.petId)) {
                    console.log('ID do pet válido:', this.petId);
                    this.loadPetDetails();
                } else {
                    console.error('ID do pet inválido:', params['id']);
                    this.utilService.showError('ID do pet inválido');
                    this.goBack();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPetDetails(): void {
        console.log('Carregando detalhes do pet ID:', this.petId);
        this.loading.set(true);
        this.apiService.getPetById(this.petId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (pet) => {
                    console.log('Pet recebido:', pet);
                    this.pet = pet;
                    this.loading.set(false);

                    // Se o pet tiver tutores, usar o primeiro como principal
                    if (pet.tutores && pet.tutores.length > 0) {
                        this.tutores = pet.tutores;
                        this.tutor = pet.tutores[0] as any;
                        console.log('Tutor principal:', this.tutor);
                        console.log('Total de tutores:', this.tutores.length);
                    } else {
                        console.log('Pet sem tutores cadastrados');
                    }
                },
                error: (error) => {
                    console.error('Erro ao carregar pet:', error);
                    this.loading.set(false);
                    this.utilService.showError('Erro ao carregar detalhes do pet');
                    setTimeout(() => this.goBack(), 2000);
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
        this.router.navigate(['/pets/update', this.petId]);
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

    formatCPF(cpf: string | number | null): string {
        if (!cpf) return 'Não informado';
        return this.utilService.maskCPF(this.utilService.formatCPF(cpf.toString()));
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

    navPetTutor(petId: number): void {
        this.router.navigate(['/pet-tutor'], {
            queryParams: { petId: petId }
        });
    }
}
