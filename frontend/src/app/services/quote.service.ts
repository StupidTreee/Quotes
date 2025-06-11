import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private baseUrl = 'http://localhost:3000/api/quotes';

  constructor(private http: HttpClient) {}

  // Alle Quotes holen
  getAllQuotes(type: 'schueler' | 'lehrer') {
    return this.http.get<any[]>(`${this.baseUrl}/${type}`);
  }

  // Einzelnes Quote nach ID holen
  getQuoteById(id: number, type: 'schueler' | 'lehrer') {
    return this.http.get<any>(`${this.baseUrl}/${type}/quote/${id}`);
  }

  // Zufälliges Quote holen
  getRandomQuote(type: 'schueler' | 'lehrer') {
    return this.http.get<any>(`${this.baseUrl}/${type}/random`);
  }

  // Neues Quote anlegen
  createQuote(quote: { message: string, timestamp: string }, type: 'schueler' | 'lehrer') {
    return this.http.post<any>(`${this.baseUrl}/${type}`, quote);
  }

  // Quote aktualisieren
  updateQuote(id: number, quote: { message?: string, timestamp?: string }, type: 'schueler' | 'lehrer') {
    return this.http.patch<any>(`${this.baseUrl}/${type}/${id}`, quote);
  }

  // Quote löschen
  deleteQuote(id: number, type: 'schueler' | 'lehrer') {
    return this.http.delete<any>(`${this.baseUrl}/${type}/${id}`);
  }
}
