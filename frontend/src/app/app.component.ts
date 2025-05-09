import { Component } from '@angular/core';
import { QuoteService } from './services/quote.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  quote: string = '';

  constructor(private quoteService: QuoteService) {}

  ngOnInit() {
    this.loadQuote();
  }

  loadQuote() {
    this.quoteService.getRandomQuote().subscribe({
      next: (data) => this.quote = data.message,
      error: (err) => console.error('Error:', err)
    });
  }
}
