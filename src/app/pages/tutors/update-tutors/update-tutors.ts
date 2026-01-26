import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UtilService } from '../../../core/services/util.service';
import { Tutores, TutoresResponse } from '../../../core/models/tutores.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-update-tutors',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-tutors.html',
  styleUrl: './update-tutors.scss',
})
export class UpdateTutors implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tutorForm!: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  tutorId: number | null = null;
  currentTutor: TutoresResponse | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadTutorData();
  }

  private initForm(): void {
    this.tutorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.maxLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(10)]],
      endereco: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
    });
  }

  private loadTutorData(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.tutorId = +id;
        this.fetchTutor(this.tutorId);
      } else {
        this.utilService.showError('ID do tutor não encontrado');
        this.router.navigate(['/tutores']);
      }
    });
  }

  private fetchTutor(id: number): void {
    this.loading.set(true);
    this.apiService.getTutorById(id).subscribe({
      next: (tutor) => {
        this.currentTutor = tutor;
        this.populateForm(tutor);

        // Se o tutor tem foto, carregar preview
        if (tutor.foto?.url) {
          this.imagePreview = tutor.foto.url;
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.utilService.showError(
          error.error?.message || 'Erro ao carregar dados do tutor'
        );
        this.router.navigate(['/tutores']);
      }
    });
  }

  private populateForm(tutor: TutoresResponse): void {
    // Formatar CPF e telefone com máscaras
 
      const cpfFormatted = tutor.cpf ? this.utilService.formatCPF(tutor.cpf.toString()) : '';
      const telefoneFormatted = tutor.telefone ? this.utilService.formatPhone(tutor.telefone) : '';
    

    this.tutorForm.patchValue({
      nome: tutor.nome,
      cpf: cpfFormatted,
      email: tutor.email,
      telefone: telefoneFormatted,
      endereco: tutor.endereco
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
    this.imagePreview = this.currentTutor?.foto?.url || null;
  }

  onSubmit(): void {
    if (this.tutorForm.invalid) {
      this.tutorForm.markAllAsTouched();
      this.utilService.showWarning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!this.tutorId) {
      this.utilService.showError('ID do tutor não encontrado');
      return;
    }

    this.submitting.set(true);

    // Remover máscaras do CPF e telefone antes de enviar
    const formValue = this.tutorForm.value;
    const tutorData: Tutores = {
      nome: formValue.nome,
      email: formValue.email,
      telefone: this.utilService.removeMask(formValue.telefone),
      endereco: formValue.endereco,
      cpf: this.utilService.removeMask(formValue.cpf)
    };

    this.apiService.updateTutor(this.tutorId, tutorData).subscribe({
      next: (response) => {
        this.utilService.showSuccess('Tutor atualizado com sucesso!');

        // Se há foto selecionada, fazer upload
        if (this.selectedFile && this.tutorId) {
          this.uploadPhoto(this.tutorId);
        } else {
          this.redirectToList();
        }
      },
      error: (error) => {
        this.submitting.set(false);
        this.utilService.showError(
          error.error?.message || 'Erro ao atualizar tutor. Tente novamente.'
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
        this.utilService.showSuccess('Foto atualizada com sucesso!');
        this.redirectToList();
      },
      error: (error) => {
        this.submitting.set(false);
        this.utilService.showWarning(
          'Tutor atualizado, mas houve erro ao enviar a foto: ' + error.message
        );
        this.redirectToList();
      }
    });
  }

  private redirectToList(): void {
    this.submitting.set(false);
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
