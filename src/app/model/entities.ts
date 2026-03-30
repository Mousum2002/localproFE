export interface PortalUser
{
    id?: number;
    userName: string; // aggiunto durante creazione AdminPage.ts
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    city: string;
    bio: string
    x: number;
    y: number;
    roles: string[];
    banned: boolean;  //aggiunto durante la creazione di AdminPage.ts
    reviews: Review[];
    operationProvided: OperationTypeByVendor[];
    profileImage?: string;  //aggiunto durante la creazione di AdminPage.ts
}

export interface Review
{
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

export interface OperationType
{
    id?: number;
    userId: number;
    name: string;
    tags: string[];
    description: string;
    status: Status;
    operationProvided: OperationTypeByVendor[];

}

export interface OperationTypeByVendor
{
    id?: number;
    portalUser: PortalUser;
    operationType: OperationType;
    price: number;
}