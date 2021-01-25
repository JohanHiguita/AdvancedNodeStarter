const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const util = require("util");
client.hget = util.promisify(client.hget); // new function that supports promises

const exec = mongoose.Query.prototype.exec;

//overwite original exec mongoose method
mongoose.Query.prototype.exec = async function () {
    //this -> Query

    if(!this.useCache){
        return exec.apply(this, arguments);
    }

    let key = Object.assign({}, this.getFilter(), {
        collection: this.mongooseCollection.name
    });

    key = JSON.stringify(key);
    console.log("key",key);
    const cacheValue = await client.hget(this.hashKey, key);
    
    if(cacheValue) {
        console.log("Getting from Cache");
        //console.log("cache", cacheValue);
        const doc = JSON.parse(cacheValue);

        //We need to return a mongoose model (or Array of models):
        //this.model->Blog
        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))  
            : new this.model(doc)

    }
    
    console.log("Getting from MongoDB");
    //execute the original exec() mongoose method
    result = await exec.apply(this, arguments);

    //Update Cache
    client.hset(this.hashKey, key, JSON.stringify(result));
    client.expire(this.hashKey, 60); //sec

    return result;
    
}

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || ""); //Top level key
    return this; //Helps cache() to be a chainable function
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}