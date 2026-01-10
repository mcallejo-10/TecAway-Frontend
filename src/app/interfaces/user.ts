export interface User {
    id_user?: number;
    email: string;
    password: string;
    name: string;
    title?: string;
    description?: string;
    town?: string;
    can_move?: boolean;
    photo?: string;
    roles: string[];
    created_at?: Date;
    updated_at?: Date;
    
    // 📍 Ubicación geográfica para búsqueda por distancia
    latitude?: number;
    longitude?: number;
    address?: string; // Dirección completa (opcional, para mostrar)
    postal_code?: string; // Código postal (útil para búsquedas)
}

export interface UserResponse {
    code: number;
    message: string;
    data: User;
}

export interface UserListResponse {
    code: number;
    message: string;
    data: User[];
}
