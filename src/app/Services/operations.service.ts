import { Injectable, signal } from "@angular/core";
import { OperationByVendor, OperationListItem } from "../model/Operations";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { VendorProfile } from "../model/User";
import { Observable, of } from "rxjs";
import { finalize, shareReplay, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root',
})

export class OperationService {  
    Operations =  signal<OperationListItem[]>([]); 
    private loaded = false;
    private loadInFlight$?: Observable<OperationListItem[]>;

    constructor(private http: HttpClient) {}

    private apiUrl = environment.apiUrl;

    /**
     * Carica la lista completa una sola volta e la memorizza in `Operations`.
     */
    public fetchAllOperations(): Observable<OperationListItem[]> {
        if (this.loaded) return of(this.Operations());
        if (this.loadInFlight$) return this.loadInFlight$;

        this.loadInFlight$ = this.http
            .get<OperationListItem[]>(`${this.apiUrl}/public/allOperationList`)
            .pipe(
                tap((data) => {
                    this.Operations.set(data);
                    this.loaded = true;
                }),
                finalize(() => {
                    this.loadInFlight$ = undefined;
                }),
                // evita doppie chiamate se più componenti lo richiedono quasi in contemporanea
                shareReplay(1)
            );

        return this.loadInFlight$;
    }

    // Backward compatible name (typo kept for existing callers).
    public fatchOperations(): void {
        this.fetchAllOperations().subscribe({
            error: (e) => console.log('Failed to fetch operations', e)
        });
    }

    public getVendorinfo (vendorId: number) {
       return this.http.get<VendorProfile>(`${this.apiUrl}/public/vendor/${vendorId}/operations`);
    }


    public createOperation(operation : OperationByVendor){
        return this.http.post(`${this.apiUrl}/api/vendor-operations`, operation);
    }

    public deleteOperation(operationId: number){
        return this.http.delete(`${this.apiUrl}/api/vendor-operations/${operationId}`);
    }

    public updateOperation(operationId: number, operation : OperationByVendor){
        return this.http.put(`${this.apiUrl}/api/vendor-operations/${operationId}`, operation);
    }


    //facciamo il filtro dalla lista completa
  



    

}