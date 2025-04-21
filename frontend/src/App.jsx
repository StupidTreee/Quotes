import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetch("/api/quotes/random")
      .then((res) => res.json())
      .then((data) =>{
        console.log(data);
        setQuote(data)
      });
  }, []);

  return (
    <div className="app">
      <h1>📜 Random Quote</h1>
      {quote ? (
        <blockquote>
          <ReactMarkdown
            children={quote.message}
            remarkPlugins={[remarkGfm]}
          />
        </blockquote>
      ) : (
        <p>Loading...</p>
      )}
      <button
        onClick={() => {
          fetch("/api/quotes/random/schueler")
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              setQuote(data);
            });
        }}
      >
        new schüler quote
      </button>
      <button
        onClick={() => {
          fetch("/api/quotes/random/lehrer")
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              setQuote(data);
            });
        }}
      >
        new lehrer quote
      </button>
    </div>
  );
}

export default App;
