import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [SharedModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
    dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
    data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

    get iconName(): string {
        switch (this.data.type) {
            case 'danger':
                return 'delete_forever';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'help_outline';
        }
    }

    get iconColor(): string {
        switch (this.data.type) {
            case 'danger':
                return 'text-red-500';
            case 'warning':
                return 'text-orange-500';
            case 'info':
                return 'text-blue-500';
            default:
                return 'text-slate-500';
        }
    }

    get iconBgColor(): string {
        switch (this.data.type) {
            case 'danger':
                return 'bg-red-100';
            case 'warning':
                return 'bg-orange-100';
            case 'info':
                return 'bg-blue-100';
            default:
                return 'bg-slate-100';
        }
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
