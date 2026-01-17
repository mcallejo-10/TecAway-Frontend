export interface User {
    id_user?: number;
    email: string;
    password: string;
    name: string;
    title?: string;
    description?: string;
    
    // 📍 Ubicación geográfica
    town?: string;              // Ciudad específica (ej: "Barcelona") - OPCIONAL
    country: string;            // Código ISO país (ej: "ES", "AR", "MX") - OBLIGATORIO
    can_move?: boolean;
    
    // 📍 Coordenadas (generadas automáticamente desde backend si hay town)
    latitude?: number;
    longitude?: number;
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
