export interface PortalUser {
    id?: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    city: string;
    bio: string;
    x: number;
    y: number;
    roles: string[];
    isBanned: boolean;        // FIX: era 'banned' → il backend manda 'isBanned'
    reviews: Review[];
    operationProvided: OperationTypeByVendor[];
    profileImage?: string;
}

export interface Review {
    id?: number;
    userId: number;
    rating: number;
    description: string;
}

export enum Status {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    PENDING = 'PENDING'
}

export interface OperationType {
    id?: number;
    userId: number;
    name: string;
    tags: string[];
    description: string;
    status: Status;
    operationProvided: OperationTypeByVendor[];
}

export interface OperationTypeByVendor {
    id?: number;
    portalUser: PortalUser;
    operationType: OperationType;
    price: number;
}