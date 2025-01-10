export interface User {
    id_user?: number;
    email: string;
    password: string;
    name: string;
    title: string;
    description: string;
    town: string;
    can_move: boolean;
    photo: string;
    roles: string;
    createdAt?: Date;
    updatedAt?: Date;
}
