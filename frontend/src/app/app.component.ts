import { Component, OnInit } from '@angular/core';
import { QuoteService } from './services/quote.service';
import { WebsocketService } from './services/websocket.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

marked.setOptions({ breaks: true });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule]
})
export class AppComponent implements OnInit {
  // Properties
  quote: string = '';
  quoteHtml: string = '';
  currentQuoteObject: any;
  searchId: number | null = null;
  searchError: string = '';
  errorTimeout: any;
  maxQuoteId: number = 0;
  quoteType: 'schueler' | 'lehrer' = 'lehrer';
  showAddQuote: boolean = false;
  newQuote: { message: string, timestamp: number } = {
    message: '',
    timestamp: Math.floor(Date.now() / 1000)
  };
  notifications: { message: string, type?: string }[] = [];
  quoteIds: number[] = []; // Array to keep track of quote IDs
  previousQuoteType: 'schueler' | 'lehrer' = this.quoteType; // Add this property to store the previous quote type

  constructor(
    private quoteService: QuoteService,
    private websocketService: WebsocketService
  ) {}

  // ==========================
  // Lifecycle Hook
  // ==========================
  ngOnInit() {
    this.getRandomQuote();
    this.getMaxQuoteId();
    this.listenForNotifications();
  }

  // ==========================
  // Notification Methods
  // ==========================
  listenForNotifications() {
    this.websocketService.onQuoteAdded().subscribe(data => {
      console.log("Notification received: Quote added", data);
      this.addNotification('Quote added');
    });
    this.websocketService.onQuoteUpdated().subscribe(data => {
      console.log("Notification received: Quote updated", data);
      this.addNotification('Quote updated');
    });
    this.websocketService.onQuoteDeleted().subscribe(data => {
      console.log("Notification received: Quote deleted", data);
      this.addNotification('Quote deleted');
    });
  }

  addNotification(message: string, type: string = 'info'): void {
    this.notifications.push({ message, type });
    // Remove the notification after 3 seconds
    setTimeout(() => {
      this.notifications.shift();
    }, 3000);
  }

  // ==========================
  // Error Handling Methods
  // ==========================
  showError(msg: string) {
    this.searchError = msg;
    this.clearError();
    this.errorTimeout = setTimeout(() => {
      this.searchError = '';
    }, 3000);
  }

  clearError() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }
  
  // ==========================
  // CRUD Methods for Quotes
  // ==========================

  // Delete Quote
  deleteCurrentQuote(): void {
    if (!this.currentQuoteObject || !this.currentQuoteObject.id) {
      this.addNotification('No quote found to delete', 'error');
      return;
    }
    const idToDelete = this.currentQuoteObject.id;
    this.quoteService.deleteQuote(idToDelete, this.quoteType).subscribe({
      next: (data) => {
        console.log('Quote deleted:', data);
        this.getRandomQuote();
        this.getMaxQuoteId();
      },
      error: (err) => {
        console.error('Error deleting quote', err);
        this.addNotification('Error deleting quote', 'error');
      }
    });
  }

  // Get the maximum quote ID
  getMaxQuoteId() {
    this.quoteService.getAllQuotes(this.quoteType).subscribe({
      next: (quotes) => {
        if (quotes && quotes.length > 0) {
          this.maxQuoteId = Math.max(...quotes.map((q: any) => q.id));
          this.quoteIds = quotes.map((q: any) => q.id); // Populate quote IDs
        } else {
          this.maxQuoteId = 1;
          this.quoteIds = [];
        }
      },
      error: () => {
        this.maxQuoteId = 1000; // Fallback value
        this.quoteIds = [];
      }
    });
  }

  // Search Quote by ID
  searchQuoteById(id: number | null) {
    this.clearError();
    if (id === null || isNaN(id)) {
      this.showError('Please enter a valid number.');
      return;
    }
    if (id < 1) {
      this.showError('ID must be positive.');
      return;
    }
    if (id > this.maxQuoteId) {
      this.showError(`Maximum ID is ${this.maxQuoteId}.`);
      return;
    }
    this.getQuoteById(id);
  }

  // Get quote by ID
  getQuoteById(id: number) {
    this.searchError = '';
    if (id === this.maxQuoteId + 1) { id = 1; }
    if (id === 0) { id = this.maxQuoteId; }
    this.quoteService.getQuoteById(id, this.quoteType).subscribe({
      next: (data) => {
        if (!data || !data.message) {
          this.searchError = 'No quote found with this ID.';
          return;
        }
        this.currentQuoteObject = data;
        this.quote = data.message;
        const parsed = marked.parse(this.quote);
        const handleHtml = (html: string) => {
          this.quoteHtml = DOMPurify.sanitize(html.replace(/(?<!>)\n/g, '<br>'));
        };
        if (parsed instanceof Promise) {
          parsed.then(handleHtml);
        } else {
          handleHtml(parsed);
        }
      },
      error: () => {
        this.searchError = 'No quote found with this ID.';
      }
    });
  }

  // Get random quote
  getRandomQuote() {
    this.quoteService.getRandomQuote(this.quoteType).subscribe({
      next: (data) => {
        this.currentQuoteObject = data;
        this.quote = data.message;
        const parsed = marked.parse(this.quote);
        const handleHtml = (html: string) => {
          this.quoteHtml = DOMPurify.sanitize(html.replace(/(?<!>)\n/g, '<br>'));
        };
        if (parsed instanceof Promise) {
          parsed.then(handleHtml);
        } else {
          handleHtml(parsed);
        }
      },
      error: (err) => console.error('Error:', err)
    });
  }

  // ==========================
  // Event Handlers
  // ==========================
  onIdInputKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      if (this.searchId === null || isNaN(this.searchId)) {
        this.searchId = 1;
      } else if (this.searchId >= this.maxQuoteId) {
        this.searchId = 1;
      } else {
        this.searchId++;
      }
      event.preventDefault();
    }
    if (event.key === 'ArrowDown') {
      if (this.searchId === null || isNaN(this.searchId)) {
        this.searchId = 1;
      } else if (this.searchId <= 1) {
        this.searchId = this.maxQuoteId;
      } else {
        this.searchId--;
      }
      event.preventDefault();
    }
  }
  onQuoteTypeChange(newType: 'schueler' | 'lehrer'): void {
    // If switching to 'schueler', confirm the change
    if (newType === 'schueler' && this.quoteType !== 'schueler') {
      const confirmed = window.confirm("Sind sie sicher Herr Professor?");
      if (!confirmed) {
        // Revert the selection to the previous type
        setTimeout(() => {
          this.quoteType = this.previousQuoteType;
        });
        return;
      }
    }
    // Update the type and remember it for future reversions
    this.previousQuoteType = this.quoteType;
    this.quoteType = newType;
    this.getRandomQuote();
    this.getMaxQuoteId();
  }

  // ==========================
  // Methods for Adding Quotes
  // ==========================
  toggleAddQuote(): void {
    this.showAddQuote = !this.showAddQuote;
  }

  addQuote(): void {
    this.quoteService.createQuote(this.newQuote, this.quoteType).subscribe({
      next: (data) => {
        console.log("Quote added:", data);
        this.toggleAddQuote();
        // Optionally update the list or fire a notification
      },
      error: (err) => {
        console.error("Error adding quote", err);
      }
    });
  }

  // ==========================
  // Navigation Methods
  // ==========================
  // Navigate to the next existing quote 
  // using some basic and prob inefficient logic but idc
nextQuote(): void {
  if (!this.currentQuoteObject || this.quoteIds.length === 0) {
    this.getRandomQuote();
    return;
  }
  const currentId = this.currentQuoteObject.id;
  const currentIndex = this.quoteIds.indexOf(currentId);
  // Wenn der aktuelle Index nicht gefunden wird, lade einen Zufallsquote
  if (currentIndex === -1) {
    this.getRandomQuote();
    return;
  }
  // Bestimme den nächsten Index – falls aktuelles Element das letzte ist, gehe zurück zum ersten.
  const nextIndex = (currentIndex + 1) % this.quoteIds.length;
  const nextId = this.quoteIds[nextIndex];
  this.getQuoteById(nextId);
}

// Navigate to the previous existing quote
previousQuote(): void {
  if (!this.currentQuoteObject || this.quoteIds.length === 0) {
    this.getRandomQuote();
    return;
  }
  const currentId = this.currentQuoteObject.id;
  const currentIndex = this.quoteIds.indexOf(currentId);
  if (currentIndex === -1) {
    this.getRandomQuote();
    return;
  }
  // Falls aktuelles Element das erste ist, gehe zum letzten.
  const prevIndex = (currentIndex - 1 + this.quoteIds.length) % this.quoteIds.length;
  const prevId = this.quoteIds[prevIndex];
  this.getQuoteById(prevId);
}

  // ==========================
  // Utility Methods
  // ==========================
  formatTimestamp(ts: number | string): string {
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
