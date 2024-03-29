var fs = require("fs")
  , path = require("path")
  , mongojs = require('mongojs')
  , _ = require('underscore')
  , args = process.argv.slice(2)
  ;

if (args.length === 0) { return help(); }

if (args.length === 3 || args.length === 4) {
  var dbName = args[0].trim()
    , db = mongojs('mongodb://localhost:27017/'+dbName)
    , collectionName = args[1].trim()
    , mdbCollection = db.collection( collectionName )
    , file = args[2].trim();
  if (args.length === 4) {
    if (args[3].trim() === "--drop") { 
      mdbCollection.remove()
      console.info(collectionName, "dropped!")
    };
  };

  console.log("loading features:", file);
  var features = loadGeojsonFeatures(file);
  console.log("count:", features.length);

  _.each(features, function(feature){
    feature.properties.dateTime_gmt = new Date(feature.properties.dateTime_gmt);
  });
  
  mdbCollection.insert(features, function(err, docs){
    if (err) { console.error(err) };
    console.log("imported:", file, "to mongo collection:", collectionName, "features count:", docs.length);
    db.close();
  });
};

function loadGeojsonFeatures(srcFile) {
  var srcFilename = path.basename(srcFile, path.extname(srcFile))
    , src = (JSON.parse(fs.readFileSync(srcFile, "utf8")))
    , features = src.features;
  return features;
}

function help() {
  var fileName = module.filename.slice(__filename.lastIndexOf(path.sep)+1);
  console.info("Usage: node", fileName, "db-name", "collection-name", "geojson", "--drop");
  console.info("e.g.:");
  console.info("node", fileName, "fatalatour", "incidents", "driveby.geojson");
  console.info("--drop [optional]: The mongo collection will be dropped before the import!");
}