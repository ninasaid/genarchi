import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { initDB, addData, getStoreData, deleteData } from "./lib/db";

const QuotesContext = createContext();
const backendIp = import.meta.env.VITE_APP_BACKEND_IP || "http://localhost:3000";
const socketIp = import.meta.env.VITE_APP_SOCKET_IP || "ws://localhost:3000"

const actions = {
    add: [],
    update: [],
    delete: [],
};

function QuotesProvider({ children }) {
    const [quotes, setQuotes] = useState([]);
    const [backendConnected, setBackendConnected] = useState(false);
    const [databaseConnected, setDatabaseConnected] = useState(false);
    const interval = React.useRef(null);
    const socket = React.useRef(null);
    const initialized = React.useRef(false);
    const [isDBReady, setIsDBReady] = useState(false);

    const handleInitDB = async () => {
        const status = await initDB();
        setIsDBReady(status);
    };

    const createNewSocket = (firstTime = false) => {
        if (socket.current && socket.current.readyState === 1) {
            return false;
        }
        console.log("Creating socket");
        try {
            if (socket.current) {
                socket.current.close();
            }
            const _socket = new WebSocket(`${socketIp}/health`);
            interval.current && clearInterval(interval.current);
            interval.current = null;
            _socket.onmessage = (ev) => {
                const data = JSON.parse(ev.data);
                if (data.database !== null) setDatabaseConnected(data.database);
                setBackendConnected(true);
            };
            _socket.onerror = (ev) => {
                console.log("Socket encountered error: ", "Closing socket");
                _socket.close();
            };
            _socket.onclose = (ev) => {
                if (!databaseConnected && !firstTime) {
                    return false;
                }
                setDatabaseConnected(false);
                console.log(
                    "Socket is closed. Reconnect will be attempted in 1 second."
                );
                socket.current = null;
                interval.current && clearInterval(interval.current);
                interval.current = null;
                interval.current = setInterval(() => {
                    if (
                        createNewSocket(true) &&
                        socket.current?.readyState === 1
                    ) {
                        console.log("Reconnected");
                        clearInterval(interval);
                    }
                }, 1000);
            };
            socket.current = _socket;
            return true;
        } catch (e) {
            console.log(e);
            setDatabaseConnected(false);
            return false;
        }
    };

    React.useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            createNewSocket(true);
            const fetchData = async () => {
                try {
                    const res = await axios.get(
                        `${backendIp}/healtcheck`
                    );
                    if (res.status === 200) {
                        setBackendConnected(true);
                    }
                } catch (err) {
                    setBackendConnected(false);
                }
            };
            fetchData();
            setInterval(() => {
                fetchData();
            }, 5000);
            handleInitDB();
        }
    }, []);

    const fetchQuotes = async () => {
        if (!databaseConnected) {
            const quotes = await getStoreData("quotes");
            console.log(quotes);
            setQuotes(quotes);
            return false;
        }
        try {
            const response = await axios
                .get(`${backendIp}/quotes`)
                .then((response) => response);
            setQuotes(response.data);
            if (isDBReady) {
                for (const quote of response.data) {
                    await addData("quotes", quote);
                }
            }
        } catch (err) {
            setQuotes([]);
        }
    };

    useEffect(() => {
        if (isDBReady || databaseConnected) {
            fetchQuotes();
        }
    }, [isDBReady, databaseConnected]);

    const addQuote = async (quote) => {
        if (!databaseConnected) {
            actions.add.push(quote);
            return false;
        }
        try {
            const response = await axios.post(
                `${backendIp}/quotes`,
                quote
            );
            const newQuote = response.data;
            await addData("quotes", newQuote);
            setQuotes([...quotes, newQuote]);
        } catch (error) {
            console.log(error);
        }
    };

    const updateQuote = async (quote, quoteId) => {
        if (!databaseConnected) {
            actions.update.push({ quote, quoteId });
            return false;
        }
        try {
            const initialQuote = await axios.get(
                `${backendIp}/quotes/${quoteId}`
            );
            initialQuote.data.content = quote.content
                ? quote.content
                : initialQuote.data.content;
            initialQuote.data.author = quote.author
                ? quote.author
                : initialQuote.data.author;
            await axios.put(
                `${backendIp}/quotes/${quoteId}`,
                initialQuote.data
            );
            let editedQuote = null;
            const updatedQuotes = quotes.map((q) => {
                if (q._id === quoteId) {
                    q.content = quote.content ? quote.content : q.content;
                    q.author = quote.author ? quote.author : q.author;
                    editedQuote = q;
                }
                return q;
            });
            await addData("quotes", editedQuote);
            setQuotes(updatedQuotes);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteQuote = async (quoteId) => {
        if (!databaseConnected) {
            actions.delete.push(quoteId);
            return false;
        }
        try {
            await axios.delete(`${backendIp}/quotes/${quoteId}`);
            const updatedQuotes = quotes.filter(
                (quote) => quote.id !== quoteId
            );
            await deleteData("quotes", quoteId);
            setQuotes(updatedQuotes);
        } catch (error) {
            console.log(error);
        }
    };

    React.useEffect(() => {
        const manageActions = async () => {
            if (databaseConnected && actions.add.length > 0) {
                for (const quote of actions.add) {
                    await addQuote(quote);
                }
                actions.add = [];
                for (const elm of actions.update) {
                    await updateQuote(elm.quote, elm.quoteId);
                }
                actions.update = [];
                for (const quoteId of actions.delete) {
                    await deleteQuote(quoteId);
                }
                actions.delete = [];
            }
        };
        manageActions();
    }, [databaseConnected]);

    const contextValue = React.useMemo(
        () => ({
            quotes,
            addQuote,
            updateQuote,
            deleteQuote,
            backendConnected,
            databaseConnected,
        }),
        [
            quotes,
            addQuote,
            updateQuote,
            deleteQuote,
            backendConnected,
            databaseConnected,
        ]
    );

    return (
        <QuotesContext.Provider value={contextValue}>
            {children}
        </QuotesContext.Provider>
    );
}

function useQuotes() {
    const context = useContext(QuotesContext);
    if (!context) {
        throw new Error(
            "useQuotes doit être utilisé à l'intérieur du fournisseur QuotesProvider"
        );
    }
    return context;
}

export { QuotesProvider, useQuotes };