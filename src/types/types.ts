export interface User {
    _id: string;
    name: string;
    role: string;
}

export interface Todo {
    _id: string;
    description: string;
    complete: boolean;
    userId: string;
}



