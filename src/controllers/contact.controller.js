const path = require("path");
const { getCollection, generateId } = require("../connectionDB.js");
const { HEADER_CONTENT_TYPE } = require("../constants/headers.js");
const mail = require("../connectionMail.js");

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
    const { id, fullname, phone, email, query, date } = values;

    return {
        id: Number(id),
        fullname: normalizeValue(fullname),
        phone: phone,
        email: email,
        query: query,
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
        const collection = await getCollection("contacts");
        const contacts = await collection.find(filters).sort({ name: 1 }).toArray();

        res.status(200).send({ success: true, data: contacts });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: ERROR_SERVER });
    }
};

const getOne = async (req, res) => {
    res.set(HEADER_CONTENT_TYPE);

    try {
        const { id } = req.params;

        const collection = await getCollection("contacts");
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
        const collection = await getCollection("contacts");
        const id = await generateId(collection);
        const contact = createSchema({ id, ...req.body });
        await collection.insertOne(contact);
        res.status(201).send({ success: true, data: contact });
        mail.send(contact);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: ERROR_SERVER });
    }
};


module.exports = { getAll, getOne, create };