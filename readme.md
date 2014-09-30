# CityCo2 API
==========

Running locally
---------------
Terminal commands
    
    mongod
    
    cd projectFolder
    node server.js

Open [127.0.0.1:8080](http://127.0.0.1:8080/) in your browser ...
	
	http://localhost:8080/


Local Setup
-----------
** If you don't already have homebrew, node, or mongodb **

Install [HomeBrew](http://brew.sh/)
Install MongoDB:
    
    brew install mongodb

Install Nodejs:
	
	brew install node

Install Nodejs dependencies*: 

	cd projectfolder
	npm install

*note that the dependencies are read in from the package.json file	


Import your data to mongodb via the import script/helpers in the `data` folder. You can edit there what geojson file is going to be imported in which collection:
	
	sh import.sh 
*note: geojson2mongo.js imports all features | geojson2mongo_time.js imports all features and reads in ISO date format and stores as mongodb date format - handy for datetime queries.

Once the data is imprted make sure to create a geospatial index for the sensors collections:

	mongo 		# starts the mongodb console
	use co2 	# co2 is the project folder
	db.sensors.ensureIndex( {"geometry": "2dsphere"} )	# sensors is the collection
	
Install package manager bower

	npm install -g bower

Install all frontend dependencies for the admin interface

	cd static/admin
	bower install
	

Openshift
---------

To be completed…


API Endpoints
-------------
### /api/sensors
returns the entire available sensor data

	http://localhost:8080/api/sensors

### /api/sensors/near/lon/lat
returns the single most close point that is queried by latitude and longitude

	http://localhost:8080/api/sensors/near/-123.01/49.4

### /api/sensors/around/lon/lat/radius
returns all of the points that fall within a specified latitude, longitude, and radius in meters.

	http://localhost:8080/api/sensors/near/-123.01/49.4/250
	
### /api/sensors/co2/ppm
returns all of the points that are greater than or equal to (co2 >= x) the specified value. Typical co2 range is between 380 and 1000

	http://localhost:8080/api/sensors/co2/450

### /api/sensors/co2/ppmlow/ppmhigh
returns all of the points that are greater than or equal to (co2>= ppmlow) ppmlow and less than or equal to ppmhigh (co2<= ppmhigh).
	
	http://localhost:8080/api/sensors/co2/420/600
	
### /api/sensors/temperature/celsius
returns all of the measured temperature points that are greater than or equal to (celsius >= x) the specified value. Values vary between winter and summer. Temperature is measured in celsius.

	http://localhost:8080/api/sensors/oTemp/15
	

### /api/sensors/yyyy-mm-dd/year-mo-da
returns all of the measured values between date1 (yyyy-mm-da) and date2 (year-mo-da). Dates are in YYYY-MM-DD format **need to figure out better naming convention**

	http://localhost:8080/api/sensors/2014-07-09/2014-07-12
	


