const express = require("express");
const multer = require("multer");
const cors = require("cors");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const contactRouter = require("./routes/contact.router.js");
const database = require("./connectionDB.js");
const mail = require("./connectionMail.js");

const { ENV_PATH, DIR_PUBLIC_PATH } = require("./constants/paths.js");
const { ERROR_SERVER } = require("./constants/messages.js");

// variables de entorno
require("dotenv").config({ path: ENV_PATH });

// Configuración de express
const server = express();
const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || "localhost";

// configuración de CORS
server.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,POST,PUT,PATCH,DELETE",
}));

// Middlewares
server.use(express.json());
server.use("/api/products", productsRouter);
server.use("/api/carts", cartsRouter);
server.use("/api/contact", contactRouter);

// Configuración de carpeta estatica
server.use("/public", express.static(DIR_PUBLIC_PATH));

// Control de errores
server.use((error, req, res, next) => {
    console.log(error);
    if (error instanceof multer.MulterError) {
        return res.status(error.code).send({ success: false, message: error.field });
    }

    res.status(500).send({ success: false, message: ERROR_SERVER });
});

// Control de rutas inexistentes
server.use("*", (req, res) => {
    res.status(404).send("<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>");
});

// Método oyente de solicitudes
server.listen(PORT, HOST, () => {
    console.log(`Server NodeJS version: ${process.version}`);
    console.log(`Ejecutandose en http://${HOST}:${PORT}`);
    database.connect(process.env.DATABASE_URL, process.env.DATABASE_NAME);
    mail.connect(process.env.BREVO_API_KEY);
});

// Método para desconectar MongoDB
process.on("SIGINT", async () => {
    await database.desconnect();
    process.exit();
});