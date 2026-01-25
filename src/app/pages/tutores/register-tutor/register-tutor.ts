import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UtilService } from '../../../core/services/util.service';
import { Tutores } from '../../../core/models/tutores.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-register-tutor',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-tutor.html',
  styleUrl: './register-tutor.scss',
})
export class RegisterTutor implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private router = inject(Router);

  tutorForm!: FormGroup;
  loading = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.tutorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      endereco: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
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
    if (this.tutorForm.invalid) {
      this.tutorForm.markAllAsTouched();
      this.utilService.showWarning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.loading.set(true);

    // Remover máscaras do CPF e telefone antes de enviar
    const formValue = this.tutorForm.value;
    const tutorData: Tutores = {
      ...formValue,
      cpf: this.utilService.removeMask(formValue.cpf),
      telefone: this.utilService.removeMask(formValue.telefone)
    };

    this.apiService.createTutor(tutorData).subscribe({
      next: (response) => {
        this.utilService.showSuccess('Tutor cadastrado com sucesso!');

        // Se há foto selecionada, fazer upload
        if (this.selectedFile && response.id) {
          this.uploadPhoto(response.id);
        } else {
          this.redirectToList();
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.utilService.showError(
          error.error?.message || 'Erro ao cadastrar tutor. Tente novamente.'
        );
      }
    });
  }

  private uploadPhoto(tutorId: number): void {
    if (!this.selectedFile) {
      this.redirectToList();
      return;
    }

    this.apiService.uploadTutorPhoto(tutorId, this.selectedFile).subscribe({
      next: () => {
        this.utilService.showSuccess('Foto enviada com sucesso!');
        this.redirectToList();
      },
      error: (error) => {
        this.loading.set(false);
        this.utilService.showWarning(
          'Tutor cadastrado, mas houve erro ao enviar a foto: ' + error.message
        );
        this.redirectToList();
      }
    });
  }

  private redirectToList(): void {
    this.loading.set(false);
    this.router.navigate(['/tutores']);
  }

  onCancel(): void {
    this.router.navigate(['/tutores']);
  }

  // Helpers para validação no template
  getErrorMessage(fieldName: string): string {
    const field = this.tutorForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['email']) return 'E-mail inválido';
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
