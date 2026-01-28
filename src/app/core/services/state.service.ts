import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TutoresResponse } from '../models/tutores.model';
import { PetsResponse } from '../models/pets.model';

/**
 * StateService - Gerencia o estado da aplicação usando BehaviorSubjects
 * Contém apenas os métodos realmente utilizados pelos Facades
 */
@Injectable({
    providedIn: 'root'
})
export class StateService {
    // Estados de Tutores
    private tutoresSubject = new BehaviorSubject<TutoresResponse[]>([]);
    private tutorSubject = new BehaviorSubject<TutoresResponse | null>(null);
    private tutoresLoadingSubject = new BehaviorSubject<boolean>(false);
    private tutoresErrorSubject = new BehaviorSubject<string | null>(null);

    // Estados de Pets
    private petsSubject = new BehaviorSubject<PetsResponse[]>([]);
    private petSubject = new BehaviorSubject<PetsResponse | null>(null);
    private petsLoadingSubject = new BehaviorSubject<boolean>(false);
    private petsErrorSubject = new BehaviorSubject<string | null>(null);

    // Observables públicos - Tutores
    public readonly tutores$: Observable<TutoresResponse[]> = this.tutoresSubject.asObservable();
    public readonly tutor$: Observable<TutoresResponse | null> = this.tutorSubject.asObservable();
    public readonly tutoresLoading$: Observable<boolean> = this.tutoresLoadingSubject.asObservable();
    public readonly tutoresError$: Observable<string | null> = this.tutoresErrorSubject.asObservable();

    // Observables públicos - Pets
    public readonly pets$: Observable<PetsResponse[]> = this.petsSubject.asObservable();
    public readonly pet$: Observable<PetsResponse | null> = this.petSubject.asObservable();
    public readonly petsLoading$: Observable<boolean> = this.petsLoadingSubject.asObservable();
    public readonly petsError$: Observable<string | null> = this.petsErrorSubject.asObservable();

    // ==================== TUTORES (métodos usados) ====================

    setTutores(tutores: TutoresResponse[]): void {
        this.tutoresSubject.next(tutores);
    }

    setTutor(tutor: TutoresResponse | null): void {
        this.tutorSubject.next(tutor);
    }

    removeTutor(id: number): void {
        const current = this.tutoresSubject.value;
        this.tutoresSubject.next(current.filter(t => t.id !== id));
    }

    setTutoresLoading(loading: boolean): void {
        this.tutoresLoadingSubject.next(loading);
    }

    setTutoresError(error: string | null): void {
        this.tutoresErrorSubject.next(error);
    }

    clearTutoresError(): void {
        this.tutoresErrorSubject.next(null);
    }

    // ==================== PETS (métodos usados) ====================

    setPets(pets: PetsResponse[]): void {
        this.petsSubject.next(pets);
    }

    setPet(pet: PetsResponse | null): void {
        this.petSubject.next(pet);
    }

    removePet(id: number): void {
        const current = this.petsSubject.value;
        this.petsSubject.next(current.filter(p => p.id !== id));
    }

    setPetsLoading(loading: boolean): void {
        this.petsLoadingSubject.next(loading);
    }

    setPetsError(error: string | null): void {
        this.petsErrorSubject.next(error);
    }

    clearPetsError(): void {
        this.petsErrorSubject.next(null);
    }
}
