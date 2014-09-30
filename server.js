var PORT = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT  || 8080;
var IPADDRESS = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var MONGOCONNECTION = 'mongodb://localhost:27017/co2';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  MONGOCONNECTION = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
                    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
                    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
                    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
                    process.env.OPENSHIFT_APP_NAME;
}

// ---------- Initialize libraries ---------- //
var express = require("express")
  , bodyParser = require('body-parser')
  , app = express()
  , mongojs = require('mongojs')
  , db = mongojs(MONGOCONNECTION)
  , _ = require('underscore')
  , sensors = db.collection('sensors')
  ;

// ---------- Default to static folder to serve hmtl ---------- //
app.use(express.static(__dirname + '/static'));

// ---------- API  ---------- //
// Remember if you want instant implementation use: nodemon server.js
app.use(bodyParser.json());
// --- The Api Json Structure --- //
app.get('/api', function(req, res){
  res.send({"hello":"crazy cool api bellow!!!!!"});
});
// --- Get ALL: Sensor data --- //
app.get('/api/sensors', function(req, res){
	findAll(sensors, {}, res);
});
// --- Get all: satellite fix by number --- //
app.get('/api/sensors/satfix/:count', function(req, res){
	var count = parseInt(req.params.count);
	findAll(sensors, {"properties.SatFix" : count}, res);
});
// --- Get one: closest 1 point --- //
app.get('/api/sensors/near/:lon/:lat', function(req, res){
  var lon = parseFloat(req.params.lon)
    , lat = parseFloat(req.params.lat);
  if (!isPoint(lon, lat)) { 
  	return res.send(400, 'bad request')
  };
  findOne(
    sensors,
    {geometry:{ $near:{ $geometry: {type:"Point", coordinates:[lon,lat]} }}},
    res
  );
});
// --- Get all: All by radius --- //
app.get('/api/sensors/around/:lon/:lat/:radius', function(req, res){
  var lon = parseFloat(req.params.lon)
    , lat = parseFloat(req.params.lat)
    , radius = parseFloat(req.params.radius)
    ;
  if (!isPoint(lon, lat)) { 
    return res.send(400, 'bad request')
  };
  findAll(
    sensors,
    {geometry:{ $near:{ $geometry: {type:"Point", coordinates:[lon,lat]}, $maxDistance: radius }}},
    res
  );
});
// --- Get all: Co2_ppm greater than x  --- //
app.get('/api/sensors/co2/:ppm', function(req, res){
	var ppm = parseInt(req.params.ppm);
	findAll(sensors, {"properties.Co2_ppm" : { $gte:ppm}}, res);
});
// --- Get all: Co2_ppm between x and y  --- //
app.get('/api/sensors/co2/:ppmlow/:ppmhigh', function(req, res){
  var ppmlow = parseInt(req.params.ppmlow);
  var ppmhigh = parseInt(req.params.ppmhigh);
  findAll(sensors, {"properties.Co2_ppm" : { $gte:ppmlow, $lte:ppmhigh}}, res);
});
// --- Get all: Temp_out  --- //
app.get('/api/sensors/temperature/:celsius', function(req, res){
  var ppm = parseInt(req.params.celsius);
  findAll(sensors, {"properties.Temp_out" : { $gte:celsius}}, res);
});
// --- Get all: by day --- //
app.get('/api/sensors/:yyyy-:mm-:dd', function(req, res){
  var yyyy = req.params.yyyy
    , mm = req.params.mm
    , dd = req.params.dd
    , sampleStart = [yyyy,mm,dd].join('-');
  var start = new Date(sampleStart);
  findAll(
    sensors,
    {"properties.dateTime_gmt": { $gte:start} },
    res
  );
});
// --- Get all: between dates --- //
app.get('/api/sensors/:yyyy-:mm-:dd/:year-:mo-:da', function(req, res){
  var yyyy = req.params.yyyy
    , mm = req.params.mm
    , dd = req.params.dd
    , sampleStart = [yyyy,mm,dd].join('-');
  var year = req.params.year
    , mo = req.params.mo
    , da = req.params.da
    , sampleEnd = [year,mo,da].join('-');
  var start = new Date(sampleStart),
      end = new Date(sampleEnd);
  findAll(
    sensors,
    {"properties.dateTime_gmt": { $gte:start, $lt:end} },
    res
  );
});


// ---------- Project Functions ---------- //
// --- Queries just for 1 instance --- //
function findOne(mdbCollection, query, res) {
  mdbCollection.findOne(
    query,
    function(err, docs) {
      if (err) { return internalError(res, err); };
      // if nothing is found (doc === null) return empty object
      res.send(docs === null ? {} : docs);
    }
  );
};
// --- Queries entire dataset --- //
function findAll(mdbCollection, query, res) {
  mdbCollection.find(
    query,
    function(err, docs) {
      if (err) { return internalError(res, err); };
      // if nothing is found (doc === null) return empty array
      res.send(docs === null ? [] : docs);
    }
  );
};
// --- Error message: something's wrong! --- //
function internalError(res, err) {
  if (err) console.error(err);
  res.send(500, 'internal server error');
};
// --- Ensure what we're querying is a valid point --- //
function isPoint(lon, lat) {
  return ((_.isNumber(lon) && _.isNumber(lat)) 
          && (Math.abs(lon) <= 180 && Math.abs(lat) <= 90))
};

/* -- server -- */
var server = require('http').createServer(app);
server.listen(PORT, IPADDRESS, function() {
  var url = "http://" + server.address().address +":"+ server.address().port;
  console.log('Serving HTTP on', url);
});