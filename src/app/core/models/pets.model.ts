export interface Pets {
    nome: string;
    raca: string;
    idade: number;
}

export interface PetsPhoto {
    id: string;
    foto: string;
}

export interface PetsResponse {
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
    tutores?: Array<{
        id: number;
        nome: string;
        email: string | null;
        telefone: string;
        endereco: string;
        cpf: number | null;
        foto: {
            id: number;
            nome: string;
            contentType: string;
            url: string;
        } | null;
    }>;
}