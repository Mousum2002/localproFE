import { Review } from "./Review";


export interface Coordinates {
  x: number;
  y: number;
}

export interface UserBase extends Coordinates {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  city?: string;
  bio?: string;
 profileImage?: string;
}

export interface CreateUserRequest extends UserBase {
  password: string;
}

export interface UserResponse extends UserBase {
  readonly id: number;
  readonly roles: string[];
  readonly reviews?: Review[];
}

export interface VendorProfile extends UserBase {
  id: number;
  reviews: Review[];
  ratingAvg: number;
  
}