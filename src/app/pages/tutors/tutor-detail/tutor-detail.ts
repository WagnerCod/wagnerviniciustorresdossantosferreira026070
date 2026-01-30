import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';
import { UtilService } from '../../../core/services/util.service';
import { TutoresResponse } from '../../../core/models/tutores.model';
import { SharedModule } from './../../../shared/shared.module';
import { LoaderPersonalized } from '../../../components_utils/loader-personalized/loader-personalized';
import { Pets } from '../../../core/models/pets.model';


@Component({
  selector: 'app-tutor-detail',
  imports: [SharedModule, LoaderPersonalized],
  templateUrl: './tutor-detail.html',
  styleUrl: './tutor-detail.scss',
  standalone: true
})
export class TutorDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  utilService = inject(UtilService);
  private destroy$ = new Subject<void>();

  tutor: TutoresResponse | null = null;
  loading = signal(false);
  tutorId!: number;

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.tutorId = +params['id'];
        if (this.tutorId && !isNaN(this.tutorId)) {
          this.loadTutorDetails();
        } else {
          console.error('ID do tutor inválido:', params['id']);
          this.utilService.showError('ID do tutor inválido');
          this.goBack();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTutorDetails(): void {
    this.loading.set(true);
    this.apiService.getTutorById(this.tutorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tutor) => {
          this.tutor = tutor;
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erro ao carregar tutor:', error);
          this.loading.set(false);
          this.utilService.showError('Erro ao carregar detalhes do tutor');
          setTimeout(() => this.goBack(), 2000);
        }
      });
  }

  getImageUrl(): string {
    if (this.tutor?.foto?.url) {
      return this.tutor.foto.url;
    }
    return '';
  }

  hasPhoto(): boolean {
    return !!this.tutor?.foto?.url;
  }

  goBack(): void {
    this.router.navigate(['/tutors']);
  }

  editTutor(): void {
    this.router.navigate(['/tutors/update', this.tutorId]);
  }

  deleteTutor(): void {
    this.utilService.confirmDelete(`o tutor ${this.tutor?.nome}`)
      .subscribe(confirmed => {
        if (confirmed) {
          this.apiService.deleteTutor(this.tutorId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.utilService.showSuccess('Tutor excluído com sucesso!');
                this.goBack();
              },
              error: (error) => {
                this.utilService.showError('Erro ao excluir tutor: ' + error.message);
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

  viewPetDetail(petId: number): void {
    this.router.navigate(['/pets', petId]);
  }

  linkPet(): void {
    this.router.navigate(['/pet-tutor'], {
      queryParams: { tutorId: this.tutorId }
    });
  }

  getPetImageUrl(pet: any): string {
    if (pet?.foto?.url) {
      return pet.foto.url;
    }
    return '';
  }

  hasPetPhoto(pet: any): boolean {
    return !!pet?.foto?.url;
  }


  deletePetTutor(tutorId: number, petId: number): void {
    this.utilService.confirmDialog({
      title: 'Desvincular Pet',
      message: 'Tem certeza que deseja desvincular este pet do tutor? O vínculo será removido.',
      confirmText: 'Sim, Desvincular',
      cancelText: 'Cancelar',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.apiService.unlinkPetFromTutor(tutorId, petId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.utilService.showSuccess('Pet desvinculado do tutor com sucesso!');
              this.loadTutorDetails();
            },
            error: (error) => {
              this.utilService.showError('Erro ao desvincular pet do tutor: ' + error.message);
            }
          });
      }
    });
  }

  viewImageTutor(): void {
    if (this.hasPhoto() && this.tutor) {
      this.utilService.openImageViewer(
        this.getImageUrl(),
        this.tutor.nome,
        'Tutor'
      );
    } else {
      this.utilService.showWarning('Não há foto disponível para visualizar');
    }
  }

  viewImagePet(pet: Pets): void {
    if (this.hasPetPhoto(pet) && this.tutor?.pets) {
      this.utilService.openImageViewer(
        this.getPetImageUrl(pet),
        pet.nome,
        'Pet'
      );
    } else {
      this.utilService.showWarning('Não há foto disponível para visualizar');
    }
  }
}
