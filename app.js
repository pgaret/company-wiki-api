const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const app = express()
const cors = require('cors')

//Setup body parser to get data from HTTP requests
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Allow CORS
app.use(cors())

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

const router = express.Router()

var URL = app.settings.env == 'development' ? 'mongodb://localhost:27017/wiki' :
        'mongodb://pgaret:password@ds141118.mlab.com:41118/heroku_17sgzk2s'

//Building the API
app.use('/api', router)

app.get('/api/v1/team', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('team').find().toArray(function(err, team){
      res.json({team: team})
    })
  })
})

app.get('/api/v1/projects', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('projects').find().toArray(function(err, projects){
      res.json({projects: projects})
    })
  })
})

app.get('/api/v1/features', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('features').find().toArray(function(err, features){
      res.json({features: features})
    })
  })
})

app.patch('/api/v1/features/:feature_id/:sub_id', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('features').findOne({_id: ObjectId(req.params.feature_id)}, function(err, feature){
      let subfeature = feature.subfeatures.filter(item=>{
        return String(ObjectId(item._id))===String(ObjectId(req.params.sub_id))
      })
      subfeature[0].name = req.body.name
      subfeature[0].description = req.body.description
      db.collection('features').updateOne({_id: ObjectId(req.params.feature_id)}, feature)
      res.json("Good work team")
    })

  })
})

app.post('/api/v1/features/:feature_id/new', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('subfeatures').insert({name: req.body.name, description: req.body.description}).then(function(err, result){
      db.collection('subfeatures').findOne({name: req.body.name}).then(function(err, resulter){
        db.collection('features').updateOne({_id: ObjectId(req.params.feature_id)}, {$push: {subfeatures: err}}, ()=>{
          res.json({result: err})
        })
      })
    })
  })
})

app.post('/api/v1/features/new', (req, res) => {
  MongoClient.connect(URL, function(err, db){
    db.collection('features').insert({name: req.body.name, subfeatures: []}).then(function(err, result){
      db.collection('features').findOne({name: req.body.name}).then(function(errs, resulter){
        res.json(errs)
      })
    })
  })
})

module.exports = app;
