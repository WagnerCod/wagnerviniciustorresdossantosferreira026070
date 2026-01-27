import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { UtilService } from '../../core/services/util.service';
import { TutoresResponse } from '../../core/models/tutores.model';
import { PetsResponse } from '../../core/models/pets.model';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-pet-tutor',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './pet-tutor.html',
  styleUrl: './pet-tutor.scss',
})
export class PetTutor implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  vinculacaoForm!: FormGroup;
  loading = false;

  // Listas
  tutoresList: TutoresResponse[] = [];
  petsList: PetsResponse[] = [];

  // Dados selecionados
  selectedTutor: TutoresResponse | null = null;
  selectedPet: PetsResponse | null = null;

  // Flags para controle
  tutorFromParam = false;
  petFromParam = false;

  // Controles de busca
  tutorSearchControl = new FormControl('');
  petSearchControl = new FormControl('');

  // Listas filtradas
  filteredTutores$!: Observable<TutoresResponse[]>;
  filteredPets$!: Observable<PetsResponse[]>;

  ngOnInit(): void {
    this.initForm();
    this.initFilterObservables();
    this.checkRouteParams();
  }

  private initForm(): void {
    this.vinculacaoForm = this.fb.group({
      tutorId: [null, Validators.required],
      petId: [null, Validators.required]
    });
  }

  private initFilterObservables(): void {
    this.filteredTutores$ = this.tutorSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTutores(value || ''))
    );

    this.filteredPets$ = this.petSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPets(value || ''))
    );
  }

  private _filterTutores(value: string): TutoresResponse[] {
    const filterValue = value.toLowerCase();
    return this.tutoresList.filter(tutor =>
      tutor.nome.toLowerCase().includes(filterValue) ||
      tutor.cpf?.toString().includes(filterValue)
    );
  }

  private _filterPets(value: string): PetsResponse[] {
    const filterValue = value.toLowerCase();
    return this.petsList.filter(pet =>
      pet.nome.toLowerCase().includes(filterValue) ||
      pet.raca?.toLowerCase().includes(filterValue)
    );
  }

  private checkRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      const tutorId = params['tutorId'];
      const petId = params['petId'];

      if (tutorId) {
        // Se recebeu tutorId, buscar e preencher automaticamente
        this.tutorFromParam = true;
        this.loadTutorById(+tutorId);
      } else {
        // Se não recebeu, carregar lista de tutores
        this.loadTutoresList();
      }

      if (petId) {
        // Se recebeu petId, buscar e preencher automaticamente
        this.petFromParam = true;
        this.loadPetById(+petId);
      } else {
        // Se não recebeu, carregar lista de pets
        this.loadPetsList();
      }
    });
  }

  private loadTutorById(id: number): void {
    this.loading = true;
    this.apiService.getTutorById(id).subscribe({
      next: (tutor) => {
        this.selectedTutor = tutor;
        this.vinculacaoForm.patchValue({ tutorId: tutor.id });
        this.loading = false;
      },
      error: (error) => {
        this.utilService.showError('Erro ao carregar tutor');
        this.loading = false;
      }
    });
  }

  private loadPetById(id: number): void {
    this.loading = true;
    this.apiService.getPetById(id).subscribe({
      next: (pet) => {
        this.selectedPet = pet;
        this.vinculacaoForm.patchValue({ petId: pet.id });
        this.loading = false;
      },
      error: (error) => {
        this.utilService.showError('Erro ao carregar pet');
        this.loading = false;
      }
    });
  }

  private loadTutoresList(): void {
    this.loading = true;
    this.apiService.getTutores(0, 100).subscribe({
      next: (response) => {
        this.tutoresList = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.utilService.showError('Erro ao carregar lista de tutores');
        this.loading = false;
      }
    });
  }

  private loadPetsList(): void {
    this.loading = true;
    this.apiService.getPets(0, 100).subscribe({
      next: (response) => {
        this.petsList = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.utilService.showError('Erro ao carregar lista de pets');
        this.loading = false;
      }
    });
  }

  onTutorSelected(tutor: TutoresResponse): void {
    this.selectedTutor = tutor;
    this.vinculacaoForm.patchValue({ tutorId: tutor.id });
  }

  displayTutorFn(tutor: TutoresResponse): string {
    return tutor ? tutor.nome : '';
  }

  onPetSelected(pet: PetsResponse): void {
    this.selectedPet = pet;
    this.vinculacaoForm.patchValue({ petId: pet.id });
  }

  displayPetFn(pet: PetsResponse): string {
    return pet ? pet.nome : '';
  }

  onSubmit(): void {
    if (this.vinculacaoForm.invalid) {
      this.utilService.showError('Por favor, preencha todos os campos');
      return;
    }

    const { tutorId, petId } = this.vinculacaoForm.value;
    this.vincularPetTutor(tutorId, petId);
  }

  private vincularPetTutor(tutorId: number, petId: number): void {
    this.loading = true;
    this.apiService.linkPetToTutor(tutorId, petId).subscribe({
      next: () => {
        this.utilService.showSuccess('Pet vinculado ao tutor com sucesso!');
        this.loading = false;
        this.router.navigate(['/tutors']);
      },
      error: (error) => {
        this.utilService.showError('Erro ao vincular pet ao tutor');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/tutors']);
  }
}
