import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'http://localhost:3000/api/quotes/schueler/random';  // passt später an

  constructor(private http: HttpClient) {}

  getRandomQuote() {
    return this.http.get<any>(this.apiUrl);
  }
}
