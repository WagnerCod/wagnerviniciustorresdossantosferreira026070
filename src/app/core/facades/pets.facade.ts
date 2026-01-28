import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { ApiService, PaginatedResponse } from '../services/api-service';
import { StateService } from '../services/state.service';
import { PetsResponse } from '../models/pets.model';

/**
 * PetsFacade - Camada Facade para operações de Pets
 * Contém apenas os métodos realmente utilizados pelos componentes
 */
@Injectable({
    providedIn: 'root'
})
export class PetsFacade {
    private readonly apiService = inject(ApiService);
    private readonly stateService = inject(StateService);

    public readonly pets$ = this.stateService.pets$;
    public readonly pet$ = this.stateService.pet$;
    public readonly loading$ = this.stateService.petsLoading$;
    public readonly error$ = this.stateService.petsError$;

    /**
     * Lista pets com paginação
     * Usado em: pets.component.ts, pet-tutor.ts
     */
    loadPets(page: number = 0, size: number = 10): Observable<PaginatedResponse<PetsResponse>> {
        this.stateService.setPetsLoading(true);
        this.stateService.clearPetsError();

        return this.apiService.getPets(page, size).pipe(
            tap(response => this.stateService.setPets(response.content)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setPetsLoading(false))
        );
    }

    /**
     * Busca pet por ID
     * Usado em: pet-detail.component.ts, pet-tutor.ts
     */
    loadPetById(id: number): Observable<PetsResponse> {
        this.stateService.setPetsLoading(true);
        this.stateService.clearPetsError();

        return this.apiService.getPetById(id).pipe(
            tap(pet => this.stateService.setPet(pet)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setPetsLoading(false))
        );
    }

    /**
     * Busca pets por nome com paginação
     * Usado em: pets.component.ts
     */
    searchPetsByName(nome: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<PetsResponse>> {
        this.stateService.setPetsLoading(true);
        this.stateService.clearPetsError();

        return this.apiService.searchPetsByName(nome, page, size).pipe(
            tap(response => this.stateService.setPets(response.content)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setPetsLoading(false))
        );
    }

    /**
     * Deleta pet
     * Usado em: pet-detail.component.ts
     */
    deletePet(id: number): Observable<void> {
        this.stateService.setPetsLoading(true);
        this.stateService.clearPetsError();

        return this.apiService.deletePet(id).pipe(
            tap(() => this.stateService.removePet(id)),
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setPetsLoading(false))
        );
    }

    /**
     * Vincula pet a um tutor
     * Usado em: pet-tutor.ts
     */
    linkToTutor(tutorId: number, petId: number): Observable<void> {
        this.stateService.setPetsLoading(true);
        this.stateService.clearPetsError();

        return this.apiService.linkPetToTutor(tutorId, petId).pipe(
            catchError(error => this.handleError(error)),
            finalize(() => this.stateService.setPetsLoading(false))
        );
    }


    private handleError(error: any): Observable<never> {
        const errorMessage = error.error?.message || error.message || 'Erro ao processar pets';
        this.stateService.setPetsError(errorMessage);
        console.error('Erro na operação de Pets:', error);
        return throwError(() => new Error(errorMessage));
    }
}
