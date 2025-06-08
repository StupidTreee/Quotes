import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private baseUrl = 'http://localhost:3000/api/quotes/schueler';

  constructor(private http: HttpClient) {}

  // Alle Quotes holen
  getAllQuotes() {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Einzelnes Quote nach ID holen
  getQuoteById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/quote/${id}`);
  }

  // Zufälliges Quote holen
  getRandomQuote() {
    return this.http.get<any>(`${this.baseUrl}/random`);
  }

  // Neues Quote anlegen
  createQuote(quote: { message: string, timestamp: string }) {
    return this.http.post<any>(this.baseUrl, quote);
  }

  // Quote aktualisieren
  updateQuote(id: number, quote: { message?: string, timestamp?: string }) {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, quote);
  }

  // Quote löschen
  deleteQuote(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
