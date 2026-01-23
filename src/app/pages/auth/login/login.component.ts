import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../../core/services/auth.service';


@Component({
    selector: 'app-login',
    standalone: true,
    imports: [SharedModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    loginForm: FormGroup;
    hidePassword = signal(true);
    loading = signal(false);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.loginForm = this.fb.group({
            username: ['admin', [Validators.required]],
            password: ['admin', [Validators.required]]
        });
    }

    ngOnInit(): void {
        // Se já estiver autenticado, redireciona para home
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
            return;
        }

        // Verifica se a sessão expirou
        this.route.queryParams.subscribe(params => {
            if (params['sessionExpired'] === 'true') {
                this.errorMessage.set('Sua sessão expirou. Por favor, faça login novamente.');
            }
        });
    }

    togglePasswordVisibility() {
        this.hidePassword.update(value => !value);
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        const { username, password } = this.loginForm.value;

        this.authService.login({ username, password }).subscribe({
            next: (response) => {
                console.log('Login realizado com sucesso', response);
                this.loading.set(false);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                console.error('Erro ao fazer login', error);
                this.loading.set(false);
                this.errorMessage.set(
                    error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.'
                );
            }
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.loginForm.get(fieldName);

        if (field?.hasError('required')) {
            return 'Este campo é obrigatório';
        }

        if (field?.hasError('email')) {
            return 'E-mail inválido';
        }

        if (field?.hasError('minlength')) {
            const minLength = field.getError('minlength').requiredLength;
            return `Mínimo de ${minLength} caracteres`;
        }

        return '';
    }
}
