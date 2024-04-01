const Joi = require("joi");
const { getCollection } = require("../connectionDB.js");

const validate = (schema, params, res, next) => {
    const { error } = schema.validate(params, { allowUnknown: true });

    if (error) {
        console.log({ error: error.details[0].message });
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

const validateParamId = (req, res, next) => {
    const schema = Joi.object({
        id: Joi.number().integer().positive().required().messages({
            "number.base": "El ID debe ser un número",
            "number.integer": "El ID debe ser un número entero",
            "number.positive": "El ID debe ser un número positivo",
            "any.required": "El ID es requerido",
        }),
    });

    validate(schema, req.params, res, next);
};

const validateBody = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(100).required(),
        phone: Joi.string().min(9).max(12).required(),
        address: Joi.string().min(1).max(100).required(),
        products: Joi.array().items(Joi.object({
            id: Joi.number().integer().positive().required(),
            name: Joi.string().min(1).max(100).required(),
            price: Joi.number().min(1).required(),
            amount: Joi.number().integer().positive().required(),
        })).required(),
    });

    const cursor = await getCollection("products");
    const products = await cursor.find({
        id: { $in: req.body.products.map((product) => product.id) }     
    }).toArray();

    for (const product of products) {
        const productIndex = req.body.products.findIndex((prod) => prod.id === product.id);
        const productSchema = Joi.object({
            id: Joi.number().integer().positive().required(),
            name: Joi.string().min(1).max(100).required(),
            price: Joi.number().min(1).required(),
            amount: Joi.number().integer().positive().max(product.stock).message('Producto id '+ product.id + ' - ' + product.name + '. Stock insuficiente').required(),
        });
        const { error } =  productSchema.validate(req.body.products[productIndex]);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        //productSchema.validate(req.body.products[productIndex]);
        //if (product.stock < req.body.products[productIndex].amount) {  
            //Joi.assert(product.stock, Joi.number().min(req.body.products[productIndex].amount).required());
        //}
    }

    validate(schema, req.body, res, next);
};

module.exports = {
    validateParamId,
    validateBody,
};