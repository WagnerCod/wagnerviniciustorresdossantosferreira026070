import { Component, inject, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { PetsFacade } from '../../../core/facades/pets.facade';
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
    private petsFacade = inject(PetsFacade);
    utilService = inject(UtilService);
    private destroy$ = new Subject<void>();

    pet: PetsResponse | null = null;
    tutor: TutoresResponse | null = null;
    tutores: any[] = [];
    loading = signal(false);
    loadingTutor = false;
    petId!: number;

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.petId = +params['id'];
                if (this.petId && !isNaN(this.petId)) {
                    this.loadPetDetails();
                } else {
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
        this.loading.set(true);
        this.petsFacade.loadPetById(this.petId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (pet) => {
                    this.pet = pet;
                    this.loading.set(false);

                    // Se o pet tiver tutores, usar o primeiro como principal
                    if (pet.tutores && pet.tutores.length > 0) {
                        this.tutores = pet.tutores;
                        this.tutor = pet.tutores[0] as any;
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
        return '';
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
        this.utilService.confirmDelete(`o pet ${this.pet?.nome}`)
            .subscribe(confirmed => {
                if (confirmed) {
                    this.petsFacade.deletePet(this.petId)
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
            });
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


    viewImagePet(): void {
        if (this.hasPhoto() && this.pet) {
            this.utilService.openImageViewer(
                this.getImageUrl(),
                this.pet.nome,
                'Pet'
            );
        } else {
            this.utilService.showWarning('Não há foto disponível para visualizar');
        }
    }

    viewImageTutor(tutor: TutoresResponse): void {
        if (tutor.foto?.url && this.pet?.tutores) {
            this.utilService.openImageViewer(
                tutor.foto.url,
                tutor.nome,
                'Tutor');
        } else {
            this.utilService.showWarning('Não há foto disponível para visualizar');
        }
    }
}
