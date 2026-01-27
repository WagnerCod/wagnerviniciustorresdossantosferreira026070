import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Tutores, TutoresResponse } from '../models/tutores.model';
import { Pets, PetsResponse } from '../models/pets.model';
import { environment } from '../../../environments/environment.prod';



export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

type ResourceType = 'tutores' | 'pets';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly BASE_URL = environment.apiUrl + '/v1';

    // BehaviorSubjects para gerenciar estado
    private dataSubjects = new Map<ResourceType, BehaviorSubject<any[]>>([
        ['tutores', new BehaviorSubject<Tutores[]>([])],
        ['pets', new BehaviorSubject<Pets[]>([])]
    ]);

    private itemSubjects = new Map<ResourceType, BehaviorSubject<any | null>>([
        ['tutores', new BehaviorSubject<Tutores | null>(null)],
        ['pets', new BehaviorSubject<Pets | null>(null)]
    ]);

    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    // Observables públicos
    public tutores$ = this.getDataSubject('tutores').asObservable();
    public tutor$ = this.getItemSubject('tutores').asObservable();
    public pets$ = this.getDataSubject('pets').asObservable();
    public pet$ = this.getItemSubject('pets').asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();

    // Métodos auxiliares para obter subjects
    private getDataSubject(resource: ResourceType): BehaviorSubject<any[]> {
        return this.dataSubjects.get(resource)!;
    }

    private getItemSubject(resource: ResourceType): BehaviorSubject<any | null> {
        return this.itemSubjects.get(resource)!;
    }

    // ==================== MÉTODOS GENÉRICOS CRUD ====================

    /**
     * Lista recursos com paginação
     */
    private getList<T>(resource: ResourceType, page: number = 0, size: number = 10): Observable<PaginatedResponse<T>> {
        this.setLoading(true);
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<PaginatedResponse<T>>(`${this.BASE_URL}/${resource}`, { params })
            .pipe(
                tap(response => {
                    this.getDataSubject(resource).next(response.content);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Busca recurso por ID
     */
    private getById<T>(resource: ResourceType, id: number): Observable<T> {
        this.setLoading(true);
        return this.http.get<T>(`${this.BASE_URL}/${resource}/${id}`)
            .pipe(
                tap(item => {
                    this.getItemSubject(resource).next(item);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Cria novo recurso
     */
    private create<T, R>(resource: ResourceType, data: T): Observable<R> {
        this.setLoading(true);
        return this.http.post<R>(`${this.BASE_URL}/${resource}`, data)
            .pipe(
                tap(newItem => {
                    const current = this.getDataSubject(resource).value;
                    this.getDataSubject(resource).next([...current, newItem]);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Atualiza recurso existente
     */
    private update<T, R>(resource: ResourceType, id: number, data: Partial<T>): Observable<R> {
        this.setLoading(true);
        return this.http.put<R>(`${this.BASE_URL}/${resource}/${id}`, data)
            .pipe(
                tap(updatedItem => {
                    const current = this.getDataSubject(resource).value;
                    if (Array.isArray(current)) {
                        const index = current.findIndex((item: any) => item.id === id);
                        if (index !== -1) {
                            current[index] = updatedItem;
                            this.getDataSubject(resource).next([...current]);
                        }
                    }
                    this.getItemSubject(resource).next(updatedItem);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Deleta recurso
     */
    private delete(resource: ResourceType, id: number): Observable<void> {
        this.setLoading(true);
        return this.http.delete<void>(`${this.BASE_URL}/${resource}/${id}`)
            .pipe(
                tap(() => {
                    const current = this.getDataSubject(resource).value;
                    if (Array.isArray(current)) {
                        this.getDataSubject(resource).next(current.filter((item: any) => item.id !== id));
                    }
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Busca recursos por parâmetro
     */
    private search<T>(resource: ResourceType, endpoint: string, params: HttpParams): Observable<T[]> {
        this.setLoading(true);
        return this.http.get<T[]>(`${this.BASE_URL}/${resource}/${endpoint}`, { params })
            .pipe(
                tap(items => {
                    this.getDataSubject(resource).next(items);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Upload de foto genérico
     */
    private uploadPhoto(resource: ResourceType, resourceId: number, file: File): Observable<any> {
        this.setLoading(true);
        const formData = new FormData();
        formData.append('foto', file);

        return this.http.post(`${this.BASE_URL}/${resource}/${resourceId}/fotos`, formData)
            .pipe(
                tap(() => this.clearError()),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Deleta foto genérico
     */
    private deletePhoto(resource: ResourceType, resourceId: number, fotoId: number): Observable<void> {
        this.setLoading(true);
        return this.http.delete<void>(`${this.BASE_URL}/${resource}/${resourceId}/foto/${fotoId}`)
            .pipe(
                tap(() => this.clearError()),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    // ==================== MÉTODOS PÚBLICOS TUTORES ====================

    getTutores(page?: number, size?: number) {
        return this.getList<TutoresResponse>('tutores', page, size);
    }

    getTutorById(id: number) {
        return this.getById<TutoresResponse>('tutores', id);
    }

    createTutor(tutor: Tutores) {
        return this.create<Tutores, TutoresResponse>('tutores', tutor);
    }

    updateTutor(id: number, tutor: Partial<Tutores>) {
        return this.update<Tutores, TutoresResponse>('tutores', id, tutor);
    }

    deleteTutor(id: number) {
        return this.delete('tutores', id);
    }

    searchTutoresByName(nome: string = '', page: number = 0, size: number = 10) {
        const params = new HttpParams()
            .set('nome', nome)
            .set('page', page.toString())
            .set('size', size.toString());

        this.setLoading(true);
        return this.http.get<PaginatedResponse<TutoresResponse>>(`${this.BASE_URL}/tutores`, { params })
            .pipe(
                tap(response => {
                    this.getDataSubject('tutores').next(response.content);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    getTutorByCPF(cpf: string) {
        this.setLoading(true);
        return this.http.get<TutoresResponse>(`${this.BASE_URL}/tutores/cpf/${cpf}`)
            .pipe(
                tap(tutor => {
                    this.getItemSubject('tutores').next(tutor);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    uploadTutorPhoto(tutorId: number, file: File) {
        return this.uploadPhoto('tutores', tutorId, file);
    }

    deleteTutorPhoto(tutorId: number, fotoId: number) {
        return this.deletePhoto('tutores', tutorId, fotoId);
    }

    // ==================== MÉTODOS PÚBLICOS PETS ====================

    getPets(page?: number, size?: number) {
        return this.getList<PetsResponse>('pets', page, size);
    }

    getPetById(id: number) {
        return this.getById<PetsResponse>('pets', id);
    }

    createPet(pet: Pets) {
        return this.create<Pets, PetsResponse>('pets', pet);
    }

    updatePet(id: number, pet: Partial<Pets>) {
        return this.update<Pets, PetsResponse>('pets', id, pet);
    }

    deletePet(id: number) {
        return this.delete('pets', id);
    }

    searchPetsByName(nome: string) {
        const params = new HttpParams().set('nome', nome);
        return this.search<PetsResponse>('pets', '', params);
    }

    getPetsByEspecie(especie: string) {
        const params = new HttpParams().set('raca', especie);
        return this.search<PetsResponse>('pets', '', params);
    }

    getPetsByTutor(tutorId: number) {
        this.setLoading(true);
        return this.http.get<PetsResponse[]>(`${this.BASE_URL}/tutores/${tutorId}/pets`)
            .pipe(
                tap(pets => {
                    this.getDataSubject('pets').next(pets);
                    this.clearError();
                }),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    uploadPetPhoto(petId: number, file: File) {
        return this.uploadPhoto('pets', petId, file);
    }

    deletePetPhoto(petId: number, fotoId: number) {
        return this.deletePhoto('pets', petId, fotoId);
    }

    // ==================== MÉTODOS DE VINCULAÇÃO PET-TUTOR ====================

    /**
     * Vincula um pet a um tutor
     */
    linkPetToTutor(tutorId: number, petId: number): Observable<void> {
        this.setLoading(true);
        return this.http.post<void>(`${this.BASE_URL}/tutores/${tutorId}/pets/${petId}`, {})
            .pipe(
                tap(() => this.clearError()),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    /**
     * Remove vinculação de um pet com um tutor
     */
    unlinkPetFromTutor(tutorId: number, petId: number): Observable<void> {
        this.setLoading(true);
        return this.http.delete<void>(`${this.BASE_URL}/tutores/${tutorId}/pets/${petId}`)
            .pipe(
                tap(() => this.clearError()),
                catchError(error => this.handleError(error)),
                finalize(() => this.setLoading(false))
            );
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Define estado de loading
     */
    private setLoading(loading: boolean): void {
        this.loadingSubject.next(loading);
    }

    /**
     * Limpa erro
     */
    private clearError(): void {
        this.errorSubject.next(null);
    }

    /**
     * Trata erros HTTP
     */
    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ocorreu um erro inesperado';

        if (error.error instanceof ErrorEvent) {
            // Erro do lado do cliente
            errorMessage = `Erro: ${error.error.message}`;
        } else {
            // Erro do lado do servidor
            errorMessage = error.error?.message ||
                error.message ||
                `Erro ${error.status}: ${error.statusText}`;
        }

        this.errorSubject.next(errorMessage);
        console.error('Erro na API:', error);
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Reseta estado de um recurso específico
     */
    resetResource(resource: ResourceType): void {
        this.getDataSubject(resource).next([]);
        this.getItemSubject(resource).next(null);
    }

    /**
     * Reseta todos os estados
     */
    resetAll(): void {
        this.dataSubjects.forEach(subject => subject.next([]));
        this.itemSubjects.forEach(subject => subject.next(null));
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
    }

    /**
     * Obtém valor atual de um recurso
     */
    getCurrentData<T>(resource: ResourceType): T[] {
        return this.getDataSubject(resource).value;
    }

    /**
     * Obtém item atual de um recurso
     */
    getCurrentItem<T>(resource: ResourceType): T | null {
        return this.getItemSubject(resource).value;
    }

    // Aliases para compatibilidade
    resetTutor = () => this.resetResource('tutores');
    resetPet = () => this.resetResource('pets');
    getCurrentTutores = () => this.getCurrentData<Tutores>('tutores');
    getCurrentPets = () => this.getCurrentData<Pets>('pets');

    /**
     * Verifica se está carregando
     */
    isLoading(): boolean {
        return this.loadingSubject.value;
    }
}
