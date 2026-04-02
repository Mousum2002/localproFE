import {Coordinates} from "./User";

export interface OperationListItem extends Coordinates
{
    id: number;
    userId: number;
    userName: string;
    ratingAvg: number;
    price: number;
    description: string;
    city: string;
    category: string;
    profileImage: string;
}


export interface OperationByVendor{
    operationTypeId: number;
    price: number;
}
export interface OperationType{
    userId: number;

}