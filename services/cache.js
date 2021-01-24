const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;
//overwite original exec mongoose method

mongoose.Query.prototype.exec = function () {
    //this -> Query
    console.log("Running a Query");

    
    //execute the original exec() method
    return exec.apply(this, arguments);
}