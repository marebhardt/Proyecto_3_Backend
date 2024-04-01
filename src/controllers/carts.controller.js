const path = require("path");
const { getCollection, generateId } = require("../connectionDB.js");
const { HEADER_CONTENT_TYPE } = require("../constants/headers.js");

const {
    ERROR_ID_NOT_FOUND,
    ERROR_SERVER
} = require("../constants/messages.js");

const normalizeValue = (value) => {
    return value
        .toUpperCase()
        .trim()
        .replace("Á", "A")
        .replace("É", "E")
        .replace("Í", "I")
        .replace("Ó", "O")
        .replace("Ú", "U");
};

const createSchema = (values) => {
    const { id, name, phone, address, products, total, date } = values;

    return {
        id: Number(id),
        name: normalizeValue(name),
        phone: phone,
        address: address,
        products: products,
        total: Number(total),
        date: date ?? new Date(),
    };
};

const getAll = async (req, res) => {
    res.set(HEADER_CONTENT_TYPE);

    try {
        const search = req.query.search ?? "";
        const filters = {};

        if (search) {
            filters["$or"] = [{ id: Number(search) }, { name: { $regex: normalizeValue(search), $options: "i" } }];
        }
        const collection = await getCollection("carts");
        const products = await collection.find(filters).sort({ name: 1 }).toArray();

        res.status(200).send({ success: true, data: products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: ERROR_SERVER });
    }
};

const getOne = async (req, res) => {
    res.set(HEADER_CONTENT_TYPE);

    try {
        const { id } = req.params;

        const collection = await getCollection("carts");
        const product = await collection.findOne({ id: Number(id) });

        if (!product) return res.status(404).send({ success: false, message: ERROR_ID_NOT_FOUND });

        res.status(200).send({ success: false, data: product });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: ERROR_SERVER });
    }
};

const create = async (req, res) => {
    res.set(HEADER_CONTENT_TYPE);
    try {
        const collection = await getCollection("carts");
        const id = await generateId(collection);
        const cart = createSchema({ id, ...req.body });
        await collection.insertOne(cart);
        cart.products.forEach(async (product) => {
            const collection = await getCollection("products");
            const productDB = await collection.findOne({ id: product.id });
            productDB.stock -= product.amount;
            await collection.updateOne({ id: product.id }, { $set: { stock: productDB.stock } });
        });
        res.status(201).send({ success: true, data: cart });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: ERROR_SERVER });
    }
};


module.exports = { getAll, getOne, create };