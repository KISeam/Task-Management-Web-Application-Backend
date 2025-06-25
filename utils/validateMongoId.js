const mongoose = require("mongoose");


const validateMongoId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    
    if(!isValid) throw new Error("This User id is not Valid");

};

module.exports = {validateMongoId};
