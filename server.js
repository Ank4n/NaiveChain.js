// import {Block, Blockchain} from 'naiveChain';

const blockchain = require('./naiveChain');
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };

let chain;

let port = 8000;

app.get('/block/:height', asyncMiddleware(async (req, res, _) => {
        if (req.params.height > chain.getBlockHeight())
            res.sendStatus(404);
        else
            res.json(JSON.parse(await chain.getBlock(parseInt(req.params.height))));
    }
));

app.post('/block', asyncMiddleware(async (req, res, _) => {
        await chain.addBlock(req.body.data);
        res.send(JSON.parse(await chain.getBlock(chain.getBlockHeight())));
    }
));

app.listen(port, () => init());

function init() {
    chain = new blockchain();
    console.log("Blockchain server running on port " + port)
}