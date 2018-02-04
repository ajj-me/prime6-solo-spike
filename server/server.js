const express = require('express');
const app = express();
const PORT = 5000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

app.use(express.static('server/public'));
app.use(bodyParser.json());

app.get('/mongodbtest', (req, res) => {
    MongoClient.connect('mongodb://localhost:27017/', function(err, client) {
        console.log('connected to mongoclient');
        const db = client.db('prime6_solo_spike');
        
        const collection = db.collection('docs');
        collection.aggregate([
            { $facet:
                {
                    "contents unwound": [
                        { $project: { _id: 1, contents: 1 } },
                        { $unwind: { path: "$contents", includeArrayIndex: "ArrayIndex" } },
                        { $lookup: { from: "docs", localField: "contents", foreignField: "_id", as: "testname" } },
                        { $unwind: { path: "$testname" } },
                        { $addFields: { dataValue: "$testname.value" } },
                        { $project: { _id: 1, contents: 1, ArrayIndex: 1, dataValue: 1 } }
                    ],
                    "containers unwound": [
                        { $project: { _id: 1, container: 1 } },
                        { $unwind: { path: "$container", includeArrayIndex: "ArrayIndex" } }
                    ]
                }
            }
        ]).toArray(function(error, result) {
            if(error) {
                console.log('error in db', error);
            } else {
                res.send(result);
            }
        });
    
    
        client.close();
    });
});

const databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/prime6_solo_spike';
mongoose.connect(databaseUrl);
mongoose.connection.on('connected', () => {
    console.log('connected to mongo');
});
mongoose.connection.on('error', () => {
    console.log('error connecting to mongo');
});


const allSchema = new mongoose.Schema({

});
const All = mongoose.model('All', allSchema, 'all');

const wikiSchema = new mongoose.Schema({
    body: [String]
});
const Wiki = mongoose.model('Wiki', wikiSchema, 'doodles');

const hatSchema = new mongoose.Schema({
    hats: String
});
const Hat = mongoose.model('Hat', hatSchema, 'doodles');

const joinSchema = new mongoose.Schema({
    parent: wikiSchema
})

app.get('/db', (req, res) => {
    console.log('hi');

    All.find({}, (error, response) => {
        if(error) {
            res.sendStatus(500);
            console.log('error', error);
        } else {
            res.send(response);
            console.log('response', response);
        }
    });
});

function random() {
    return Math.random().toString();
}
console.log(random());

app.get('/dummy/hats', (req, res) => {
    hatToSave = new Hat({hats: random()});
    hatToSave.save( (error, response) => {
        if(error) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
            console.log(response);
        }
    });
});

app.get('/dummy/wiki', (req, res) => {
    wikiToSave = new Wiki({body: [random(), random(), random()]});
    wikiToSave.save( (error, response) => {
        if(error) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
            console.log(response);
        }
    });
});

app.get('/dummy/junction', (req, res) => {
    wikiToSave = new Wiki({body: [random(), random(), random()]});
    wikiToSave.save( (error, response) => {
        if(error) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
            console.log(response);
        }
    });
});

app.listen(PORT, () => {
    console.log('listening on', PORT);
});


