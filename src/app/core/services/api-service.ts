import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

/**
 * ApiService - Responsável apenas por chamadas HTTP
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly BASE_URL = environment.apiUrl + '/v1';

    // ==================== TUTORES ====================

    getTutores(page: number = 0, size: number = 10): Observable<PaginatedResponse<TutoresResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginatedResponse<TutoresResponse>>(`${this.BASE_URL}/tutores`, { params });
    }

    getTutorById(id: number): Observable<TutoresResponse> {
        return this.http.get<TutoresResponse>(`${this.BASE_URL}/tutores/${id}`);
    }

    createTutor(tutor: Tutores): Observable<TutoresResponse> {
        return this.http.post<TutoresResponse>(`${this.BASE_URL}/tutores`, tutor);
    }

    updateTutor(id: number, tutor: Partial<Tutores>): Observable<TutoresResponse> {
        return this.http.put<TutoresResponse>(`${this.BASE_URL}/tutores/${id}`, tutor);
    }

    deleteTutor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE_URL}/tutores/${id}`);
    }

    searchTutoresByName(nome: string = '', page: number = 0, size: number = 10): Observable<PaginatedResponse<TutoresResponse>> {
        const params = new HttpParams()
            .set('nome', nome)
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginatedResponse<TutoresResponse>>(`${this.BASE_URL}/tutores`, { params });
    }

    uploadTutorPhoto(tutorId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('foto', file);
        return this.http.post(`${this.BASE_URL}/tutores/${tutorId}/fotos`, formData);
    }

    deleteTutorPhoto(tutorId: number, fotoId: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE_URL}/tutores/${tutorId}/foto/${fotoId}`);
    }

    // ==================== PETS ====================

    getPets(page: number = 0, size: number = 10): Observable<PaginatedResponse<PetsResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginatedResponse<PetsResponse>>(`${this.BASE_URL}/pets`, { params });
    }

    getPetById(id: number): Observable<PetsResponse> {
        return this.http.get<PetsResponse>(`${this.BASE_URL}/pets/${id}`);
    }

    createPet(pet: Pets): Observable<PetsResponse> {
        return this.http.post<PetsResponse>(`${this.BASE_URL}/pets`, pet);
    }

    updatePet(id: number, pet: Partial<Pets>): Observable<PetsResponse> {
        return this.http.put<PetsResponse>(`${this.BASE_URL}/pets/${id}`, pet);
    }

    deletePet(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE_URL}/pets/${id}`);
    }

    searchPetsByName(nome: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<PetsResponse>> {
        const params = new HttpParams()
            .set('nome', nome)
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginatedResponse<PetsResponse>>(`${this.BASE_URL}/pets`, { params });
    }

    uploadPetPhoto(petId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('foto', file);
        return this.http.post(`${this.BASE_URL}/pets/${petId}/fotos`, formData);
    }

    linkPetToTutor(tutorId: number, petId: number): Observable<void> {
        return this.http.post<void>(`${this.BASE_URL}/tutores/${tutorId}/pets/${petId}`, {});
    }
    unlinkPetFromTutor(tutorId: number, petId: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE_URL}/tutores/${tutorId}/pets/${petId}`);
    }
}
