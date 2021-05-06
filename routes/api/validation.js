const Joi = require("@hapi/joi");
///////////////////////////////////////////////////////////////////////////////////
// auth.js validation
//
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    });
    const { error } = schema.validate(data);
    return error;
};

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    });
    const { error } = schema.validate(data);
    return error;
};

///////////////////////////////////////////////////////////////////////////////////
// fileman.js validation
//
const filePostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        content: Joi.binary().required(),
        isfile: Joi.boolean().default("true"),
    });
    const { error } = schema.validate(data);
    return error;
};
const fileDeleteValidation = (data) => {
    const schema = Joi.object({
        path: Joi.string().required(),
        force: Joi.boolean().default("false"),
    });
    const { error } = schema.validate(data);
    return error;
};

///////////////////////////////////////////////////////////////////////////////////
// mssql.js validation
//
const mssqlCustomerValidation = (data) => {
    const schema = Joi.object({
        customerid: Joi.number().integer(), // zero for new record
        firstname: Joi.string().max(50).required(),
        lastname: Joi.string().max(50).required(),
    });
    const { error } = schema.validate(data);
    return error;
};

module.exports = {
    registerValidation,
    loginValidation,
    filePostValidation,
    fileDeleteValidation,
    mssqlCustomerValidation,
};
