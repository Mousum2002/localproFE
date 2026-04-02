export interface Review {
    id?: number;
    userId: number;
    userName?: string;
    rating: number;
    description: string;
    createdAt?: string | Date;
}