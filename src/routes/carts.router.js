const Router = require("express");
const { validateParamId, validateBody } = require("../validations/carts.validation.js");
const { getAll, getOne, create, update, remove, uploadImage } = require("../controllers/carts.controller.js");

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