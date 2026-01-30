import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ImageViewerData {
    imageUrl: string;
    title?: string;
    subtitle?: string;
}

@Component({
    selector: 'app-image-viewer-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './image-viewer-dialog.component.html',
    styleUrls: ['./image-viewer-dialog.component.scss']
})
export class ImageViewerDialogComponent {
    imageLoaded = false;
    imageError = false;

    constructor(
        public dialogRef: MatDialogRef<ImageViewerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ImageViewerData
    ) { }

    onImageLoad(): void {
        this.imageLoaded = true;
    }

    onImageError(): void {
        this.imageError = true;
        this.imageLoaded = true;
    }

    close(): void {
        this.dialogRef.close();
    }
}
