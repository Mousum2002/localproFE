import { Injectable, signal } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CreateUserRequest, UserBase, UserResponse } from "../model/User";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment.development";


@Injectable({
    providedIn: 'root',
})

export class AuthService {

    constructor(private http: HttpClient, private router: Router) { }

    user = new BehaviorSubject<UserBase>(null);
    isAdmin = signal<boolean>(false);
    private apiUrl = environment.apiUrl;

    signIn(userName: string, password: string) {
        const body = new URLSearchParams();
         body.set('username', userName);
        body.set('password', password);
        return this.http.post<UserResponse>(`${this.apiUrl}/api/auth/login`,body.toString(),
        {headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })}).
        pipe(tap((user: UserResponse)=> { this.user.next(user); localStorage.setItem('user', JSON.stringify(user)); if(user.roles.includes('ADMIN')) { this.isAdmin.set(true); }  }))
    }
    signUp(user: CreateUserRequest): Observable<UserResponse> {
        return this.http.post<UserResponse>(`${this.apiUrl}/public/register`, user).pipe(tap((user: UserResponse) => { this.user.next(user); localStorage.setItem('user', JSON.stringify(user)); }))
    }


    logout() {
    this.http.post(`${this.apiUrl}/api/auth/logout`, {}).subscribe(
        {
            next: () => {
                this.user.next(null);
                localStorage.removeItem('user');
                this.router.navigate(['/home']);
            },
            error: (e) => {
                console.error('Logout failed', e);
            }
        }
    );
  }


  //per admin solo, andrebbe messo in una classe separata dopo
    banUser(id: number) {
    if (!this.isAdmin() && !confirm("Sei sicuro di voler bannare questo utente?")) {
      return console.warn("Azione di ban annullata dall'utente non admin");
    }
    else{
    return this.http.put<UserResponse>(`${this.apiUrl}/admin/ban/${id}`, {});}}

deleteReview(id: number) {
    if (!this.isAdmin() && !confirm("Sei sicuro di voler eliminare questa recensione?")) {
      return console.warn("Azione di ban annullata dall'utente non admin");
    }
    else{
    return this.http.delete(`${this.apiUrl}/admin/reviews/${id}`);}
}

getAllUsers() {
    if (!this.isAdmin()) {
      return console.warn("Azione di ban annullata dall'utente non admin");
    }
    return this.http.get<UserResponse[]>(`${this.apiUrl}/admin/all`);}


deleteUser(id: number) {
    if (!this.isAdmin() && !confirm("Sei sicuro di voler eliminare questo utente?")) {
      return console.warn("Azione di ban annullata dall'utente non admin");
    }
    else{
    return this.http.delete(`${this.apiUrl}/admin/delete/${id}`);}
}


}