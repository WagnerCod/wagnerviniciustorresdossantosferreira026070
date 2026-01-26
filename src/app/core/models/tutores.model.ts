export interface Tutores {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf: string;
}

export interface TutoresPhoto {
    id: number;
    nome: string;
    contentType: string;
    url: string;
}

export interface TutoresResponse {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf: number;
    foto?: TutoresPhoto;
    pets?: Array<{
        id: number;
        nome: string;
        raca: string;
        idade: number;
        foto?: {
            id: number;
            nome: string;
            contentType: string;
            url: string;
        };
    }>;
}
