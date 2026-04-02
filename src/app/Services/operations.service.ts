import { Injectable, signal } from "@angular/core";
import { OperationByVendor, OperationListItem } from "../model/Operations";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { VendorProfile } from "../model/User";

@Injectable({
    providedIn: 'root',
})

export class OperationService {  
    Operations =  signal<OperationListItem[]>([]); 

    constructor(private http: HttpClient) {}

    private apiUrl = environment.apiUrl;

    public fatchOperations(){
        this.http.get<OperationListItem[]>(`${this.apiUrl}/public/allOperationList`).subscribe({
            next: (data) => {
                this.Operations.set(data);
            },
            error: (e) => {
                console.log('Failed to fetch operations', e);
            }
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