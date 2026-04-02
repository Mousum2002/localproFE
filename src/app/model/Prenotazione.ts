export interface PrenotazioneRequest {
    serviceId: number;
    note: string;
    // Supporta entrambi i nomi campo usati lato frontend/back-end.
    // Il backend sembra aspettarsi `reservationDate`, ma in alcuni punti veniva usato `dateTime`.
    reservationDate?: string;
    dateTime?: string;
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