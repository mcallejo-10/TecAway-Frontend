export interface User {
    id_user?: number;
    email: string;
    password: string;
    name: string;
    title?: string;
    description?: string;
    
    // Ubicación geográfica (todas obligatorias, vienen del autocomplete del backend)
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    can_move?: boolean;
    postal_code?: string;
    
    photo?: string;
    roles: string[];
    created_at?: Date;
    updated_at?: Date;
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
