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

/** Mirrors backend `PortalUserRequestDTO` (PUT user update). */
export interface PortalUserRequest {
  userName: string;
  email: string;
  password: string;
  x: number;
  y: number;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  city?: string;
  address?: string;
  bio?: string;
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