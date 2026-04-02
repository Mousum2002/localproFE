export interface PrenotazioneRequest {
    serviceId: number;
    note: string;
    dateTime: string;
}

export interface PrenotazioneResponse{
    id: number;
    vendorId: number;
    vendorUserName: string;
    vendorCity: string;
    serviceId: number;
    serviceOperationName: string;
    serviceDescription: string;
    servicePrice: number;
    userId: number;
    userName: string;
    reservationDate: string;
    status: string;
note: string;

}