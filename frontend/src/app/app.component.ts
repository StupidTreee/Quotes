import { Component, OnInit } from '@angular/core';
import { QuoteService } from './services/quote.service';
import { WebsocketService } from './services/websocket.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// to respect \n in markdown
marked.setOptions({ breaks: true });


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule]
})
export class AppComponent implements OnInit {
  quote: string = '';
  quoteHtml: string = '';
  currentQuoteObject: any;

  searchId: number | null = null;
  searchError: string = '';
  errorTimeout: any;

  maxQuoteId: number = 0;

  quoteType: 'schueler' | 'lehrer' = 'schueler';

  showAddQuote: boolean = false;
  newQuote: { message: string, timestamp: number } = { message: '', timestamp: Math.floor(Date.now() / 1000) };

  notifications: { message: string, type?: string }[] = [];

  constructor(private quoteService: QuoteService,
              private websocketService: WebsocketService) {}

  ngOnInit() {
    this.GetRandomQuote();
    this.getMaxQuoteId();
    this.listenForNotifications();
  }

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
    // Entferne die Notification nach 3 Sekunden:
    setTimeout(() => {
      this.notifications.shift();
    }, 3000);
  }

  getMaxQuoteId() {
    this.quoteService.getAllQuotes(this.quoteType).subscribe({
      next: (quotes) => {
        if (quotes && quotes.length > 0) {
          this.maxQuoteId = Math.max(...quotes.map((q: any) => q.id));
        } else {
          this.maxQuoteId = 1;
        }
      },
      error: () => {
        this.maxQuoteId = 1000; // Fallback
      }
    });
  }

  searchQuoteById(id: number | null) {
    this.clearError();
    if (id === null || isNaN(id)) {
      this.showError('Bitte eine Zahl eingeben.');
      return;
    }
    if (id < 1) {
      this.showError('ID muss positiv sein.');
      return;
    }
    if (id > this.maxQuoteId) {
      this.showError(`Maximale ID ist ${this.maxQuoteId}.`);
      return;
    }
    this.GetQuoteById(id);
  }

  showError(msg: string) {
    this.searchError = msg;
    this.clearError();
    this.errorTimeout = setTimeout(() => {
      this.searchError = '';
    }, 3000); // 3 Sekunden sichtbar
  }

  clearError() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  GetQuoteById(id: number) {
    this.searchError = '';
    if (id === this.maxQuoteId + 1) {id = 1}
    if (id === 0) {id = this.maxQuoteId}
    this.quoteService.getQuoteById(id, this.quoteType).subscribe({
      next: (data) => {
        if (!data || !data.message) {
          this.searchError = 'Kein Zitat mit dieser ID gefunden.';
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
        this.searchError = 'Kein Zitat mit dieser ID gefunden.';
      }
    });
  }

  GetRandomQuote() {
    this.quoteService.getRandomQuote(this.quoteType).subscribe({
      next: (data) => {
        this.currentQuoteObject = data;
        this.quote = data.message;
        const parsed = marked.parse(this.quote);
        const handleHtml = (html: string) => {
          // Ersetze einzelne Zeilenumbrüche durch <br>, aber nicht innerhalb von <pre> oder <code>
          // Für einfache Fälle reicht das:
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

  onIdInputKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      if (this.searchId === null || isNaN(this.searchId)) {
        this.searchId = 1;
      } else if (this.searchId >= this.maxQuoteId) {
        this.searchId = 1; // Wrap-Around zu 1
      } else {
        this.searchId++;
      }
      event.preventDefault();
    }
    if (event.key === 'ArrowDown') {
      if (this.searchId === null || isNaN(this.searchId)) {
        this.searchId = 1;
      } else if (this.searchId <= 1) {
        this.searchId = this.maxQuoteId; // Wrap-Around zu max
      } else {
        this.searchId--;
      }
      event.preventDefault();
    }
  }

  onQuoteTypeChange(type: 'schueler' | 'lehrer') {
    this.quoteType = type;
    this.GetRandomQuote();
    this.getMaxQuoteId();
  }

  formatTimestamp(ts: number | string): string {
    // Falls der Timestamp als String kommt, in Zahl umwandeln
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleAddQuote(): void {
    this.showAddQuote = !this.showAddQuote;
  }

  addQuote(): void {
    // Beispiel: Verwendung des aktuellen quoteType; passe ggf. die Logik an
    this.quoteService.createQuote(this.newQuote, this.quoteType).subscribe({
      next: (data) => {
        console.log("Quote hinzugefügt:", data);
        this.toggleAddQuote(); // Formular schließen
        // Optional: Liste aktualisieren oder Notification auslösen
      },
      error: (err) => {
        console.error("Fehler beim Hinzufügen der Quote", err);
      }
    });
  }
}
