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
     * Remove formatação do CPF: 123.456.789-00 -> 12345678900
     */
    cleanCPF(cpf: string): string {
        if (!cpf) return '';
        return cpf.replace(/\D/g, '');
    }

    /**
     * Valida CPF
     */
    validateCPF(cpf: string): boolean {
        const cleanCPF = this.cleanCPF(cpf);

        if (cleanCPF.length !== 11) return false;
        if (/^(\d)\1+$/.test(cleanCPF)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

        return true;
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
     * Remove formatação do telefone
     */
    cleanPhone(phone: string): string {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    }

    /**
     * Formata CEP: 12345678 -> 12345-678
     */
    formatCEP(cep: string): string {
        if (!cep) return '';
        const cleanCEP = cep.replace(/\D/g, '');
        return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    /**
     * Remove formatação do CEP
     */
    cleanCEP(cep: string): string {
        if (!cep) return '';
        return cep.replace(/\D/g, '');
    }

    /**
     * Valida email
     */
    validateEmail(email: string): boolean {
        if (!email) return false;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Formata data: 2024-01-21 -> 21/01/2024
     */
    formatDate(date: string | Date): string {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Formata data e hora: 2024-01-21T10:30:00 -> 21/01/2024 às 10:30
     */
    formatDateTime(date: string | Date): string {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    }

    /**
     * Converte data string para objeto Date
     */
    parseDate(dateString: string): Date | null {
        if (!dateString) return null;

        // Formato DD/MM/YYYY
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        // Formato ISO
        return new Date(dateString);
    }

    /**
     * Converte Base64 para Blob
     */
    base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
        const byteCharacters = atob(base64.split(',')[1] || base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    }

    /**
     * Faz download de arquivo
     */
    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Gera URL de imagem a partir de Base64
     */
    getImageUrl(base64: string, contentType: string = 'image/jpeg'): string {
        if (!base64) return '';
        if (base64.startsWith('http')) return base64;
        if (base64.startsWith('data:')) return base64;
        return `data:${contentType};base64,${base64}`;
    }

    /**
     * Capitaliza primeira letra de cada palavra
     */
    capitalizeWords(text: string): string {
        if (!text) return '';
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Trunca texto com reticências
     */
    truncateText(text: string, maxLength: number): string {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

 
    /**
     * Debounce para otimizar chamadas de função
     */
    debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Gera ID único
     */
    generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Copia texto para área de transferência
     */
    async copyToClipboard(text: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Copiado para área de transferência!');
            return true;
        } catch (error) {
            this.showError('Erro ao copiar texto');
            return false;
        }
    }



    /**
     * Remove acentos de string
     */
    removeAccents(text: string): string {
        if (!text) return '';
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Verifica se é dispositivo móvel
     */
    isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    /**
     * Aguarda por determinado tempo (para uso em async/await)
     */
    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
