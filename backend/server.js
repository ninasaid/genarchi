require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
let connectedToDatabase = false;

const connectWithRetry = () => {
    mongoose
        .connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Délai d'attente pour la sélection du serveur (en millisecondes)
        })
        .catch(() => {});
};

mongoose.connection.on("connected", () => {
    console.log("Connexion à la base de données réussie");
    connectedToDatabase = true;
    clients.forEach((ws) => {
        ws.send(
            JSON.stringify({
                database: connectedToDatabase,
            })
        );
    });
});

mongoose.connection.on("disconnected", () => {
    console.log(
        "Connexion à la base de données perdue. Tentative de reconnexion..."
    );
    setTimeout(connectWithRetry, 10000); // Réessayez toutes les 10 secondes
    connectedToDatabase = false;
    clients.forEach((ws) => {
        ws.send(
            JSON.stringify({
                database: connectedToDatabase,
            })
        );
    });
});

connectWithRetry(); // Lance la première tentative de connexion

const Quote = mongoose.model("Quote", {
    content: String,
    author: String,
});

app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        header: "*",
    })
);

// Endpoint pour créer une citation
app.post("/quotes", async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/healthcheck", async (req, res) => {
    res.send("healthy");
});

app.get("/healtcheck", async (req, res) => {
    res.send("healthy");
});

app.get("/healtcheck", async (req, res) => {
    res.send("healthy");
});

// Endpoint pour obtenir toutes les citations
app.get("/quotes", async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint pour obtenir une citation par son ID
app.get("/quotes/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const quote = await Quote.findById(id);
        if (!quote) {
            res.status(404).json({ message: "Citation non trouvée" });
        } else {
            res.json(quote);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint pour mettre à jour une citation par son ID
app.put("/quotes/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const quote = await Quote.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!quote) {
            res.status(404).json({ message: "Citation non trouvée" });
        } else {
            res.json(quote);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint pour supprimer une citation par son ID
app.delete("/quotes/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const quote = await Quote.findByIdAndDelete(id);
        if (!quote) {
            res.status(404).json({ message: "Citation non trouvée" });
        } else {
            res.json({ message: "Citation supprimée avec succès" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const server = app.listen(port, () => {
    console.log(`Serveur backend Node.js écoutant sur le port ${port}`);
});

const wss = new WebSocketServer({
    server,
    path: "/health",
});

const clients = [];

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4();
};

wss.on("connection", (ws) => {
    ws.id = wss.getUniqueID();
    clients.push(ws);
    console.log(clients.length);
    ws.send(
        JSON.stringify({
            database: connectedToDatabase,
        })
    );
    ws.on("message", (message) => {
        console.log(`Message reçu : ${message}`);
        ws.send("pong");
    });
    ws.on("close", () => {
        clients.splice(clients.indexOf(ws), 1);
        console.log(clients.length);
    });
});

process.on("SIGINT", function () {
    clients.forEach((ws) => {
        ws.send(
            JSON.stringify({
                database: false,
                backend: false,
            })
        );
    });
    server.close();
    process.exit(0);
});
