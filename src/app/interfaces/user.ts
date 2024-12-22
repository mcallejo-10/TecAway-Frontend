export interface User {
    id_user?: number;
    email: string;
    password: string;
    name: string;
    title: string;
    description: string;
    cp: number;
    distance: number;
    photo: string;
    roles: string;
    createdAt?: Date;
    updatedAt?: Date;
}
