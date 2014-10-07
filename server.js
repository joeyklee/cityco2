var PORT = process.env.OPENSHIFT_NODEJS_PORT  || 8080;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var MONGOCONNECTION = 'mongodb://localhost:27017/co2';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
	MONGOCONNECTION = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
										process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
										process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
										process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
										process.env.OPENSHIFT_APP_NAME;
};


var express = require("express")
	, bodyParser = require('body-parser')
	, app = express()
	, _ = require('underscore')
	, path = require("path")
	, mongojs = require('mongojs')
	, db = mongojs(MONGOCONNECTION)
	, points = db.collection('points')
	;

var propertyMap = {
	'gpsfix': 'properties.GpsFix',
	'gpsquality': 'properties.GpsQuality',
	'speed': 'properties.Speed_kmh',
	'height': 'properties.Height_m',
	'temperature': 'properties.Temp_out'
};

app.use(bodyParser.json());
app.use('*', function(req, res, next) {
	// set CORS response header
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.use(express.static(path.join(__dirname,'/static')));

app.get('/api/points', function(req, res){
	// TODO console.log(req.query.sensor_id)
	findAll(points, {}, res);
});

app.get('/api/point/near/:lon/:lat', function(req, res){
	// TODO console.log(req.query.sensor_id)
	var lon = parseFloat(req.params.lon)
		, lat = parseFloat(req.params.lat)
		, query = {};
	if (!isPoint(lon,lat)) return handleError(null, req, res, 400, 'bad request');
	query["geometry"] = { $near:{ $geometry: {type:"Point", coordinates:[lon,lat]} }};
	findOne(points, query, res);
});

app.get('/api/points/near/:lon/:lat/:radius', function(req, res){
	// TODO console.log(req.query.sensor_id)
	var lon = parseFloat(req.params.lon)
		, lat = parseFloat(req.params.lat)
		, radius = parseFloat(req.params.radius);
	if (!isPoint(lon,lat)) return handleError(null, req, res, 400, 'bad request');
	findAll(
		points,
		{geometry:{ $near:{ $geometry: {type:"Point", coordinates:[lon,lat]}, $maxDistance: radius }}},
		res
	);
});

app.get('/api/points/:property/gte/:threshold', function(req, res){
	// TODO console.log(req.query.sensor_id)
	var property = propertyMap[req.params.property]
		, threshold = parseFloat(req.params.threshold);
	if (!property) return handleError(null, req, res, 404, "doesn't exists");
	var query = {}, orderby = {};
	query[property] = { $gte: threshold};
	orderby[property] = 1;
	findAll(points, {$query: query, $orderby: orderby}, res);
});

app.get('/api/points/:property/range/:low/:high', function(req, res){
	// TODO console.log(req.query.sensor_id)
	var property = propertyMap[req.params.property]
		, low = parseInt(req.params.low)
		, high = parseInt(req.params.high)
		, query = {};
	if (!property) return handleError(null, req, res, 404, "doesn't exists");
	var query = {}, orderby = {};
	query[property] = { $gte: low, $lte: high};
	orderby[property] = 1;
	findAll(points, {$query: query, $orderby: orderby}, res);
});

app.get('/api/points/time/:yyyy-:mm-:dd', function(req, res){
	var start = new Date([req.params.yyyy, req.params.mm, req.params.dd].join('-') + " " + [00,00,00].join(':'))
		, end = new Date([req.params.yyyy, req.params.mm, req.params.dd].join('-')+ " " + [23,59,59].join(':'));

  var map = function() {
    // TODO mapped time window hardcoded to 60 seconds, parameterize time window
    var dateTime = new Date(this.properties.dateTime_gmt);
    dateTime.setSeconds(0);
    emit(dateTime.getTime(), this);
  };

  var reduce = function(date, features) {
    var avgFeature = features[0]
      , featureCount = features.length
      , avgProperties = ['Speed_kmh', 'Height_m', 'Co2_ppm']
      , sums = {};

    // calculate averages
    for (var i = 0; i < featureCount; i++) {
      var featureProps = features[i].properties;
      for (var j = 0; j < avgProperties.length; j++) {
        var avgProp = avgProperties[j];
        if (!sums[avgProp]) sums[avgProp] = 0;
        sums[avgProp] += featureProps[avgProp];
      }
    }

    // set average values in feature properties
    for (var i = 0; i < avgProperties.length; i++) {
      var avgProp = avgProperties[i];
      avgFeature.properties[avgProp] = sums[avgProp] / featureCount;
    }
    
    // delete no longer relevant/correct properties from feature
    delete avgFeature._id;
    delete avgFeature.id;

    return avgFeature;
  };

  var options = {
    query: { "properties.dateTime_gmt": { $gte:start, $lte:end } },
    out: { inline: 1 }
  };

  points.mapReduce(map, reduce, options, function(err, results, stats) {
    if (err) return mongoError(res, err);
    res.send(_.map(results, function(result) {
      return result.value;
    }));
  });
});

app.get('/api/points/time/:yyyy1-:mm1-:dd1/:yyyy2-:mm2-:dd2', function(req, res){
	// TODO console.log(req.query.sensor_id)
	var start = new Date([req.params.yyyy1, req.params.mm1, req.params.dd1].join('-'))
		, end = new Date([req.params.yyyy2, req.params.mm2, req.params.dd2].join('-'));
	findAll(
		points,
		{$query:{"properties.dateTime_gmt": { $gte:start, $lt:end}}, $orderby: {"properties.dateTime_gmt":1}},
		res
	);
});


/* -- Helper functions -- */
function findOne(collection, query, res) {
	collection.findOne(
		query,
		function(err, docs) {
			if (err) { return mongoError(res, err); };
			// if nothing is found (doc === null) return empty object
			res.send(docs === null ? {} : docs);
		}
	);
};

function findAll(collection, query, res) {
	collection.find(
		query,
		function(err, docs) {
			if (err) { return mongoError(res, err); };
			// if nothing is found (doc === null) return empty array
			res.send(docs === null ? [] : docs);
		}
	);
};

function aggregate(collection, pipeline, res) {
	collection.aggregate(
		pipeline,
		function(err, docs) {
			if (err) { return mongoError(res, err); };
			// if nothing is found (doc === null) return empty array
			res.send(docs === null ? [] : docs);
		}
	);
};

var handleError = function(err, req, res, statusCode, msg) {
	console.error('%s %s %s', req.url, msg, err || '');
	return res.sendStatus(statusCode);
};

function mongoError(res, err) {
  if (err) console.error('mongo error ->', err);
  return res.status(500).send('internal server error')
};

function isPoint(lon, lat) {
	return ((_.isNumber(lon) && _.isNumber(lat)) 
					&& (Math.abs(lon) <= 180 && Math.abs(lat) <= 90))
};


/* -- Server -- */
app.listen(PORT, IPADDRESS, function() {
	console.log('Serving API on http://%s:%s', IPADDRESS, PORT);
});