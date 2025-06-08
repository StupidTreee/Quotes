import { Component } from '@angular/core';
import { QuoteService } from './services/quote.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// to respect \n in markdown
marked.setOptions({ breaks: true });


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  quote: string = '';
  quoteHtml: string = '';

  constructor(private quoteService: QuoteService) {}

  ngOnInit() {
    this.loadQuote();
  }

  loadQuote() {
    this.quoteService.getRandomQuote().subscribe({
      next: (data) => {
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
}
