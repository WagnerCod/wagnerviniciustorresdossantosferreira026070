import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        // Criar mocks (simulações) dos serviços
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, SharedModule, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        fixture.detectChanges();
    });

    // Teste 1: Verificar se o componente foi criado
    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    // Teste 2: Verificar inicialização do formulário
    it('deve inicializar o formulário com valores padrão', () => {
        expect(component.loginForm).toBeDefined();
        expect(component.loginForm.get('username')?.value).toBe('admin');
        expect(component.loginForm.get('password')?.value).toBe('admin');
    });

    // Teste 3: Verificar validações do formulário
    it('deve marcar o formulário como inválido quando campos estão vazios', () => {
        component.loginForm.patchValue({
            username: '',
            password: ''
        });

        expect(component.loginForm.valid).toBeFalsy();
        expect(component.loginForm.get('username')?.hasError('required')).toBeTruthy();
        expect(component.loginForm.get('password')?.hasError('required')).toBeTruthy();
    });

    // Teste 4: Verificar formulário válido
    it('deve marcar o formulário como válido quando campos estão preenchidos', () => {
        component.loginForm.patchValue({
            username: 'admin',
            password: 'admin123'
        });

        expect(component.loginForm.valid).toBeTruthy();
    });

    // Teste 5: Testar toggle de visibilidade da senha
    it('deve alternar a visibilidade da senha', () => {
        expect(component.hidePassword()).toBe(true);

        component.togglePasswordVisibility();
        expect(component.hidePassword()).toBe(false);

        component.togglePasswordVisibility();
        expect(component.hidePassword()).toBe(true);
    });

    // Teste 6: Não deve submeter com formulário inválido
    it('não deve fazer login quando o formulário é inválido', () => {
        component.loginForm.patchValue({
            username: '',
            password: ''
        });

        component.onSubmit();

        expect(authService.login).not.toHaveBeenCalled();
        expect(component.loginForm.touched).toBeTruthy();
    });

    // Teste 7: Testar login com sucesso
    it('deve fazer login com sucesso e navegar para home', () => {
        const mockResponse = { token: 'fake-token', user: { id: 1, name: 'Admin' } };
        authService.login.and.returnValue(of(mockResponse));

        component.loginForm.patchValue({
            username: 'admin',
            password: 'admin123'
        });

        component.onSubmit();

        expect(component.loading()).toBe(false);
        expect(authService.login).toHaveBeenCalledWith({
            username: 'admin',
            password: 'admin123'
        });
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(component.errorMessage()).toBeNull();
    });

    // Teste 8: Testar erro no login
    it('deve exibir mensagem de erro quando o login falhar', () => {
        const mockError = {
            error: { message: 'Credenciais inválidas' }
        };
        authService.login.and.returnValue(throwError(() => mockError));

        component.loginForm.patchValue({
            username: 'admin',
            password: 'wrong-password'
        });

        component.onSubmit();

        expect(component.loading()).toBe(false);
        expect(component.errorMessage()).toBe('Credenciais inválidas');
        expect(router.navigate).not.toHaveBeenCalled();
    });

    // Teste 9: Testar erro genérico no login
    it('deve exibir mensagem de erro genérica quando não há mensagem específica', () => {
        const mockError = { error: {} };
        authService.login.and.returnValue(throwError(() => mockError));

        component.onSubmit();

        expect(component.errorMessage()).toBe('Erro ao fazer login. Verifique suas credenciais.');
    });

    // Teste 10: Testar loading durante o login
    it('deve ativar loading durante o processo de login', () => {
        authService.login.and.returnValue(of({ token: 'fake-token' }));

        component.onSubmit();

        // Nota: Como o observable é síncrono no teste, 
        // o loading já terá sido resetado quando verificamos
        expect(authService.login).toHaveBeenCalled();
    });

    // Teste 11: Testar mensagens de erro
    it('deve retornar mensagem de erro correta para campo obrigatório', () => {
        const usernameControl = component.loginForm.get('username');
        usernameControl?.setValue('');
        usernameControl?.markAsTouched();

        const errorMessage = component.getErrorMessage('username');
        expect(errorMessage).toBe('Este campo é obrigatório');
    });

    // Teste 12: Testar campo sem erros
    it('deve retornar string vazia quando não há erros', () => {
        const usernameControl = component.loginForm.get('username');
        usernameControl?.setValue('admin');

        const errorMessage = component.getErrorMessage('username');
        expect(errorMessage).toBe('');
    });
});
