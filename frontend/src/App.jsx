import { useState, useEffect } from "react";
import "./App.scss";
import arrow from "./assets/arrow.svg";
import Quote from "./components/Quote";
import { useQuotes } from "./QuoteContext";

function App() {
    const { quotes, databaseConnected, backendConnected, addQuote } =
        useQuotes();
    const [quote, setQuote] = useState(null);
    const [index, setIndex] = useState(0);
    useEffect(() => {
        console.log(quotes);
        if (quotes.length > 0 && quotes != []) {
            setQuote(quotes[0]);
        }
    }, [quotes]);

    function handleNext() {
        if (index < quotes.length - 1) {
            setIndex(index + 1);
            setQuote(quotes[index + 1]);
        } else {
            setIndex(0);
            setQuote(quotes[0]);
        }
    }

    function handlePrev() {
        if (index > 0) {
            setIndex(index - 1);
            setQuote(quotes[index - 1]);
        } else {
            setIndex(quotes.length - 1);
            setQuote(quotes[quotes.length - 1]);
        }
    }

    const handleAddQuote = () => {
        const newQ = { content: "test", author: "test" };
        addQuote(newQ);
    };

    return (
        <>
            <div className="status">
                <p>{backendConnected ? "Backend connected" : "Backend down"}</p>
                <p>
                    {databaseConnected ? "Database connected" : "Database down"}
                </p>
            </div>
            <div className="container">
                <div className="arrow" onClick={handlePrev}>
                    <img src={arrow} alt="arrow" />
                </div>
                {quote ? (
                    <Quote
                        quote={quote.content}
                        author={quote.author}
                        index={index + 1}
                        max={quotes.length}
                        id={quote._id}
                    />
                ) : (
                    <button className="add" onClick={handleAddQuote}>
                        Ajouter
                    </button>
                )}
                <div className="arrow" onClick={handleNext}>
                    <img src={arrow} alt="arrow" className="right" />
                </div>
            </div>
        </>
    );
}

export default App;
