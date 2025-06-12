import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.SERVER_URL);
    // Log beim Verbinden:
    this.socket.on('connect', () => {
      console.log('Socket connected with id:', this.socket.id);
    });
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  public onQuoteAdded(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('quoteAdded', (data) => {
        observer.next(data);
      });
    });
  }

  public onQuoteUpdated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('quoteUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  public onQuoteDeleted(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('quoteDeleted', (data) => {
        observer.next(data);
      });
    });
  }
}