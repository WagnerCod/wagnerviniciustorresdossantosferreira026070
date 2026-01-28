import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';
import { UtilService } from '../../../core/services/util.service';
import { Pets, PetsResponse } from '../../../core/models/pets.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-update-pet',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-pet.html',
  styleUrl: './update-pet.scss',
})
export class UpdatePet implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  petForm!: FormGroup;
  loading = signal(false);
  loadingSubmit = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  petId!: number;
  currentPet: PetsResponse | null = null;
  currentPhotoUrl: string | null = null;
  originalPetName: string = '';
  photoChanged = false;

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.petId = +params['id'];
        if (this.petId && !isNaN(this.petId)) {
          this.loadPetData();
        } else {
          this.utilService.showError('ID do pet inválido');
          this.router.navigate(['/pets']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.petForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      raca: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idade: ['', [Validators.required, Validators.min(0), Validators.max(50)]]
    });
  }

  private loadPetData(): void {
    this.loading.set(true);
    this.apiService.getPetById(this.petId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pet) => {
          this.currentPet = pet;
          this.originalPetName = pet.nome;
          this.currentPhotoUrl = pet.foto?.url || null;
          this.imagePreview = this.currentPhotoUrl;

          this.initForm();
          this.petForm.patchValue({
            nome: pet.nome,
            raca: pet.raca,
            idade: pet.idade
          });

          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.utilService.showError('Erro ao carregar dados do pet');
          this.router.navigate(['/pets']);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        this.utilService.showError('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.utilService.showError('A imagem deve ter no máximo 5MB');
        return;
      }

      this.selectedFile = file;
      this.photoChanged = true;

      // Gerar preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.currentPhotoUrl; // Volta para a foto atual
    this.photoChanged = false;
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      this.utilService.showWarning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.loadingSubmit.set(true);
    const petData: Partial<Pets> = this.petForm.value;

    this.apiService.updatePet(this.petId, petData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.utilService.showSuccess('Pet atualizado com sucesso!');

          // Se há foto nova selecionada, fazer upload
          if (this.selectedFile && this.photoChanged) {
            this.uploadPhoto(this.petId);
          } else {
            this.redirectToDetails();
          }
        },
        error: (error) => {
          this.loadingSubmit.set(false);
          this.utilService.showError(
            error.error?.message || 'Erro ao atualizar pet. Tente novamente.'
          );
        }
      });
  }

  private uploadPhoto(petId: number): void {
    if (!this.selectedFile) {
      this.redirectToDetails();
      return;
    }

    this.apiService.uploadPetPhoto(petId, this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.utilService.showSuccess('Foto atualizada com sucesso!');
          this.redirectToDetails();
        },
        error: (error) => {
          this.loadingSubmit.set(false);
          this.utilService.showWarning(
            'Pet atualizado, mas houve erro ao enviar a foto: ' + error.message
          );
          this.redirectToDetails();
        }
      });
  }

  private redirectToDetails(): void {
    this.loadingSubmit.set(false);
    this.router.navigate(['/pets', this.petId]);
  }

  onCancel(): void {
    this.router.navigate(['/pets', this.petId]);
  }

  // Helpers para validação no template
  getErrorMessage(fieldName: string): string {
    const field = this.petForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;

    return 'Campo inválido';
  }
}
