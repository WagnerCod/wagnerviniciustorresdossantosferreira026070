import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class UtilService {
    constructor(private snackBar: MatSnackBar) { }

    /**
     * notificação de sucesso
     */
    showSuccess(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Fechar', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
        });
    }


    /**
 * notificação de informação
 */
    showInfo(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Fechar', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['info-snackbar']
        });
    }

    /**
     * notificação de erro
     */
    showError(message: string, duration: number = 5000): void {
        this.snackBar.open(message, 'Fechar', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
        });
    }

    /**
     * notificação de aviso
     */
    showWarning(message: string, duration: number = 4000): void {
        this.snackBar.open(message, 'Fechar', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['warning-snackbar']
        });
    }

    /**
     * Formata CPF: 12345678900 -> 123.456.789-00
     */
    formatCPF(cpf: string): string {
        if (!cpf) return '';
        const cleanCPF = cpf.replace(/\D/g, '');
        return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    /**
     * Mascara CPF para exibição: 12345678900 -> 123.***.***.00
     */
    maskCPF(cpf: string | number | null): string {
        if (!cpf) return 'Não informado';

        const cpfString = cpf.toString();
        const cleanCPF = cpfString.replace(/\D/g, '');

        if (cleanCPF.length !== 11) return cpfString;

        const firstThree = cleanCPF.substring(0, 3);
        const lastTwo = cleanCPF.substring(9, 11);

        return `${firstThree}.***.***.${lastTwo}`;
    }

    /**
     * Formata telefone: 11999999999 -> (11) 99999-9999
     */
    formatPhone(phone: string): string {
        if (!phone) return '';
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length === 11) {
            return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleanPhone.length === 10) {
            return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }

        return phone;
    }

    /**
     * Remove todas as máscaras/formatações de um valor (mantém apenas números)
     */
    removeMask(value: string): string {
        if (!value) return '';
        return value.replace(/\D/g, '');
    }
}
