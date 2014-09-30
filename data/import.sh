echo "Joey's Data to MongoDB"
# node geojson2mongo.js co2 sensors /Users/apple/Dropbox/UBC/Thesis/MobileCO2/projects/current/MobileProofOfConcept/web/city_co2_api/data/traverse_20140912.geojson --drop
node geojson2mongo_time.js co2 sensors /Users/apple/Dropbox/UBC/Thesis/MobileCO2/projects/current/MobileProofOfConcept/web/city_co2_api/data/traverse_20140912.geojson --drop
exit