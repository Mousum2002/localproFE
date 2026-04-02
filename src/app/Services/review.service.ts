import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Review } from "../model/Review";


@Injectable({
    providedIn: 'root',
})

export class ReviewService{

    constructor(private http: HttpClient) {}

    reviews = signal<Review>(null);


    private apiUrl = environment.apiUrl;

    postReview(review: Review) {
      //inviare senza username
      return this.http.post(`${this.apiUrl}/api/reviews`, review);
    }


    loadVendorReviews(userName: string) {
    this.http.get<Review>(`${this.apiUrl}/api/reviews/vendor/${userName}`)
      .subscribe({ 
        next: r => {
          console.table(r);
          this.reviews.set(r);
        },
        error: () => console.error("Errore caricamento recensioni")
      });
  }

}