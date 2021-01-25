const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const util = require("util");
client.get = util.promisify(client.get); // new function that supports promises

const exec = mongoose.Query.prototype.exec;

//overwite original exec mongoose method
mongoose.Query.prototype.exec = async function () {
    //this -> Query

    let key = Object.assign({}, this.getFilter(), {
        collection: this.mongooseCollection.name
    });

    key = JSON.stringify(key);
    console.log("key",key);
    const cacheValue = await client.get(key);
    
    console.log("cache", cacheValue);
    if(cacheValue) {
        console.log("Getting from Cache");
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
    client.set(key, JSON.stringify(result));

    return result;
    
}