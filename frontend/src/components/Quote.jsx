import quote1 from "../assets/quote1.svg";
import quote2 from "../assets/quote2.svg";
import pencil from "../assets/crayon.svg";
import bin from "../assets/poubelle.svg";
import { useQuotes } from "../QuoteContext";
import { useState } from "react";

export default function Quote({ quote, author, index, max, id }) {
    const { addQuote, updateQuote, deleteQuote } = useQuotes();
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newQuote, setNewQuote] = useState(quote);
    const [newAuthor, setNewAuthor] = useState(author);

    const handleAddQuote = () => {
        const newQ = { content: newQuote, author: newAuthor };
        if (newQuote && newAuthor) {
            addQuote(newQ);
        }
        setIsAdding(false);
    };

    const handleUpdateQuote = () => {
        const newQ = { content: newQuote, author: newAuthor };
        updateQuote(newQ, id);
        setIsEditing(false);
    };

    function handleContentChange(event) {
        setNewQuote(event.target.value);
    }

    function handleAuthorChange(event) {
        setNewAuthor(event.target.value);
    }

    const handleDeleteQuote = () => {
        deleteQuote(id);
        window.location.reload();
    };

    return (
        <div className="cube">
            {!isAdding ? (
                <>
                    {isEditing ? (
                        <>
                            <button className="add" onClick={handleUpdateQuote}>
                                Sauvegarder
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="add"
                                onClick={() => {
                                    setIsAdding(true);
                                    setNewAuthor("");
                                    setNewQuote("");
                                }}
                            >
                                Ajouter
                            </button>
                        </>
                    )}
                    <div className="page">
                        <p>
                            {index}/{max}
                        </p>
                    </div>
                    <div className="quote">
                        <img src={quote1} alt="quote" />
                        {isEditing ? (
                            <input
                                placeholder={quote}
                                onChange={handleContentChange}
                            />
                        ) : (
                            <p>{quote}</p>
                        )}
                        <img src={quote2} alt="quote" className="bas" />
                    </div>
                    <div className="footer">
                        <div className="left">
                            <img
                                src={pencil}
                                onClick={() => {
                                    setIsEditing(true);
                                    setNewAuthor(author);
                                    setNewQuote(quote);
                                }}
                                alt="logo"
                            />
                            <img
                                src={bin}
                                onClick={handleDeleteQuote}
                                alt="logo"
                            />
                        </div>

                        <div className="right">
                            {isEditing ? (
                                <input
                                    placeholder={author}
                                    onChange={handleAuthorChange}
                                />
                            ) : (
                                <>
                                    <p>{author}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="progress">
                        <hr style={{ width: `${(index / max) * 100}%` }} />
                    </div>
                </>
            ) : (
                <>
                    <button className="add" onClick={handleAddQuote}>
                        Ajouter Quotes
                    </button>
                    <div className="quote">
                        <img src={quote1} alt="quote" />
                        <input
                            placeholder="Your Quote"
                            onChange={handleContentChange}
                        />
                        <img src={quote2} alt="quote" className="bas" />
                    </div>
                    <div className="footer">
                        <div className="left">
                            <p>Author Name :</p>
                            <input
                                placeholder="John Doe"
                                onChange={handleAuthorChange}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
