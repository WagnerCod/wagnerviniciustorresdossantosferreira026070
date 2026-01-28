import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { ApiService, PaginatedResponse } from '../services/api-service';
import { StateService } from '../services/state.service';
import { TutoresResponse } from '../models/tutores.model';

/**
 * TutorsFacade - Camada Facade para operações de Tutores
 * Contém apenas os métodos realmente utilizados pelos componentes
 */
@Injectable({
    providedIn: 'root'
})
export class TutorsFacade {
    private readonly apiService = inject(ApiService);
    private readonly stateService = inject(StateService);

    public readonly tutores$ = this.stateService.tutores$;
    public readonly tutor$ = this.stateService.tutor$;
    public readonly loading$ = this.stateService.tutoresLoading$;
    public readonly error$ = this.stateService.tutoresError$;

    /**
     * Lista tutores com paginação
     * Usado em: pet-tutor.ts
     */
    loadTutores(page: number = 0, size: number = 10): Observable<PaginatedResponse<TutoresResponse>> {
        this.stateService.setTutoresLoading(true);
        this.stateService.clearTutoresError();

        return this.apiService.getTutores(page, size).pipe(
            tap(response => this.stateService.setTutores(response.content)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setTutoresLoading(false))
        );
    }

    /**
     * Busca tutor por ID
     * Usado em: tutors.component.ts, pet-tutor.ts
     */
    loadTutorById(id: number): Observable<TutoresResponse> {
        this.stateService.setTutoresLoading(true);
        this.stateService.clearTutoresError();

        return this.apiService.getTutorById(id).pipe(
            tap(tutor => this.stateService.setTutor(tutor)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setTutoresLoading(false))
        );
    }

    /**
     * Busca tutores por nome com paginação
     * Usado em: tutors.component.ts
     */
    searchTutoresByName(nome: string = '', page: number = 0, size: number = 10): Observable<PaginatedResponse<TutoresResponse>> {
        this.stateService.setTutoresLoading(true);
        this.stateService.clearTutoresError();

        return this.apiService.searchTutoresByName(nome, page, size).pipe(
            tap(response => this.stateService.setTutores(response.content)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setTutoresLoading(false))
        );
    }

    /**
     * Deleta tutor
     * Usado em: tutors.component.ts
     */
    deleteTutor(id: number): Observable<void> {
        this.stateService.setTutoresLoading(true);
        this.stateService.clearTutoresError();

        return this.apiService.deleteTutor(id).pipe(
            tap(() => this.stateService.removeTutor(id)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setTutoresLoading(false))
        );
    }

    /**
     * Deleta foto do tutor
     * Usado em: tutors.component.ts
     */
    deletePhoto(tutorId: number, fotoId: number): Observable<void> {
        this.stateService.setTutoresLoading(true);
        this.stateService.clearTutoresError();

        return this.apiService.deleteTutorPhoto(tutorId, fotoId).pipe(
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setTutoresLoading(false))
        );
    }

    private handleError(error: any): Observable<never> {
        const errorMessage = error.error?.message || error.message || 'Erro ao processar tutores';
        this.stateService.setTutoresError(errorMessage);
        console.error('Erro na operação de Tutores:', error);
        return throwError(() => new Error(errorMessage));
    }
}
