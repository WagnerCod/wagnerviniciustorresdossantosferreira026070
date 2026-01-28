import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { UtilService } from '../../../core/services/util.service';
import { Pets } from '../../../core/models/pets.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-register-pet',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-pet.html',
  styleUrl: './register-pet.scss',
})
export class RegisterPet implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private router = inject(Router);

  petForm!: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.petForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      raca: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idade: ['', [Validators.required, Validators.min(0), Validators.max(50)]]
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
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      this.utilService.showWarning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    this.petForm.disable();
    const petData: Pets = this.petForm.getRawValue();

    this.apiService.createPet(petData).subscribe({
      next: (response) => {
        this.utilService.showSuccess('Pet cadastrado com sucesso!');

        // Se há foto selecionada, fazer upload
        if (this.selectedFile && response.id) {
          this.uploadPhoto(response.id);
        } else {
          this.redirectToList();
        }
      },
      error: (error) => {
        this.loading = false;
        this.petForm.enable();
        this.utilService.showError(
          error.message || 'Erro ao cadastrar pet. Tente novamente.'
        );
      }
    });
  }

  private uploadPhoto(petId: number): void {
    if (!this.selectedFile) {
      this.redirectToList();
      return;
    }

    this.apiService.uploadPetPhoto(petId, this.selectedFile).subscribe({
      next: () => {
        this.utilService.showSuccess('Foto enviada com sucesso!');
        this.redirectToList();
      },
      error: (error) => {
        this.loading = false;
        this.petForm.enable();
        this.utilService.showWarning(
          'Pet cadastrado, mas houve erro ao enviar a foto: ' + error.message
        );
        this.redirectToList();
      }
    });
  }

  private redirectToList(): void {
    this.loading = false;
    this.router.navigate(['/pets']);
  }

  onCancel(): void {
    this.router.navigate(['/pets']);
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
    if (field.errors['min']) {
      return `Valor mínimo: ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `Valor máximo: ${field.errors['max'].max}`;
    }

    return 'Campo inválido';
  }
}
