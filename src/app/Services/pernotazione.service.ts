import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PrenotazioneRequest, PrenotazioneResponse } from "../model/Prenotazione";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class PrenotazioneService {

    constructor(private http:HttpClient) {}

    private apiUrl = environment.apiUrl;
    createPrenotazione (prenotazione: PrenotazioneRequest) {
        return this.http.post(`${this.apiUrl}/api/prenotazioni`, prenotazione);
    }


    getUserPrenotazioni() {
        return this.http.get<PrenotazioneResponse[]>(`${this.apiUrl}/api/prenotazioni/getOutoingPrenotazioni`);
    }

    getVendorPrenotazioni() {
        return this.http.get<PrenotazioneResponse[]>(`${this.apiUrl}/api/prenotazioni/getIncomingPrenotazioni`);
    }

    updatePrenotazioneStatus(id: number, status: string) {
        return this.http.put<PrenotazioneResponse>(`${this.apiUrl}/api/prenotazioni/update`, { "id": id, "status": status });
    }

    cancelPrenotazione(id: number) {
        return this.http.delete(`${this.apiUrl}/api/prenotazioni/${id}`);
    }
}