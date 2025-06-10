import { Component } from '@angular/core';
import { QuoteService } from './services/quote.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { NgIf } from '@angular/common';

// to respect \n in markdown
marked.setOptions({ breaks: true });


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [NgIf]
})
export class AppComponent {
  quote: string = '';
  quoteHtml: string = '';
  currentQuoteObject: any;

  constructor(private quoteService: QuoteService) {}

  ngOnInit() {
    this.GetRandomQuote();
  }

  GetRandomQuote() {
    this.quoteService.getRandomQuote().subscribe({
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

  GetQuoteById(id: number) {
    this.quoteService.getQuoteById(id).subscribe({
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
}
