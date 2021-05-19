const { registerValidation,
    loginValidation,
    filePostValidation,
    fileDeleteValidation,
    mssqlCustomerValidation,
    coursesPutValidation,
    coursesPostValidation } = require("./validation.js");

it("runs", () =>
{
    expect(1).toBe(1);

});

//
// loginValidation
//
it ("Validates login args", () => {
    // const schema = Joi.object({
    //     email: Joi.string().min(6).required().email(),
    //     password: Joi.string().min(6).required(),
    // });

    var args = { email: "some@some.com", 
                 password: "blah blah"
               };
    var error = loginValidation(args);
    expect(error).toBe(undefined); 
})

//
// registerValidation
//
it ("Validates register args", () => {
    // const schema = Joi.object({
    //     name: Joi.string().min(3).required(),
    //     email: Joi.string().min(6).required().email(),
    //     password: Joi.string().min(6).required(),
    // });
    var args = { name: "some string", 
                 email: "blah@blah.com", 
                 password: "dfasdfdsaafs" };
    var error = registerValidation(args);
    expect(error).toBe(undefined); 
})

//
// filePostValidation
//
it ("Validates file Post", () => {
    // const schema = Joi.object({
    //     name: Joi.string().min(3).required(),
    //     content: Joi.binary().required(),
    //     isfile: Joi.boolean().default("true"),
    // });
    var args = { name: "some string", 
                 content: "blah blah", 
                 isfile: false };
    var error = filePostValidation(args);
    expect(error).toBe(undefined); 
})

//
// fileDeleteValidation
//
it ("Validates file Delete", () => {
    // const schema = Joi.object({
    //     path: Joi.string().required(),
    //     force: Joi.boolean().default("false"),
    // });
    var args = {
        path: "Some string is required",
        force: undefined
    };
    var error = fileDeleteValidation(args);
    expect(error).toBe(undefined);


})


//
// mssqlCustomerValidation 
//
it ("Validates mssqlCustomer arguments", () => {

    // const schema = Joi.object({
    //     customerid: Joi.number().integer(), // zero for new record
    //     firstname: Joi.string().max(50).required(),
    //     lastname: Joi.string().max(50).required(),
    // });
    var args = { customerid : 1,
                 firstname : 'Fred',
                 lastname: 'Mertz' };
    var error = mssqlCustomerValidation(args);

    expect(error).toBe(undefined);
    


})


//
// Courses arguments valuation 
//
it ("Validates Courses PUT arguments", () => {
    var args = { id: 1, name: "course one" }; 
    var error = coursesPutValidation(args);
   
    expect(error).toBe(undefined);

    var args = { name: "course one" }; 
    var error = coursesPutValidation(args);
   
    expect(error.message).toBe('"id" is required');

})

it ("Validates Courses POST arguments", () => {
    var args = { name: "course one" }; 
    var error = coursesPostValidation(args);
   
    expect(error).toBe(undefined);

})
