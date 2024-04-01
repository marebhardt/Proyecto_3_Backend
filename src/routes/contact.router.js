const Router = require("express");
const { validateParamId, validateBody } = require("../validations/contact.validation.js");
const { getAll, getOne, create } = require("../controllers/contact.controller.js");

const routes = Router();

routes
    .get("/", (req, res) => {
        getAll(req, res);
    })
    .get("/:id", validateParamId, (req, res) => {
        getOne(req, res);
    })
    .post("/", validateBody, (req, res) => {
        create(req, res);
    })

module.exports = routes;