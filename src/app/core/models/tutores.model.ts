export interface Tutores {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf: string;
}

export interface TutoresPhoto {
    id: string;
    foto: string;
}

export interface TutoresResponse {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf: string;
    foto: Array<{
        id: string;
        foto: string;
        contentType: string;
        url: string;
    }>;
    page: number;
    size: number;
}
