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
** If you don't already have homebrew, node, or mongodb... **

Install [HomeBrew](http://brew.sh/)
Install MongoDB:
    
    brew install mongodb

Install Nodejs:
	
	brew install node

** if you already have homebrew and node... **

Install Nodejs dependencies: 

	cd projectfolder
	npm install

*note that the dependencies are read in from the package.json file	


Import your data to mongodb via the import script/helpers in the `data` folder. You can edit there what geojson file is going to be imported in which collection:
	
	sh import.sh 
*note: geojson2mongo.js imports all features | geojson2mongo_time.js imports all features and reads in ISO date format and stores as mongodb date format - handy for datetime queries.

Once the data is imprted make sure to create a geospatial index for the sensors collections:

	mongo 		# starts the mongodb console
	use co2 	# co2 is the project folder
	db.points.ensureIndex( {"geometry": "2dsphere"} )	# points is the name of the collection 
	
Install package manager bower

	npm install -g bower

Install all frontend dependencies for the admin interface

	cd static/admin 
	bower install
	

Running on Openshift
---------

To be completed…


API Endpoints
-------------
### Properties:
The properties that can be queried in the dataset are:
	
	gpsfix
	gpsquality
	speed
	height
	temperature
	...
	

### /api/points
returns all the points from the dataset

	http://localhost:8080/api/points

### /api/point/near/lon/lat
returns the single most close point that is queried by latitude and longitude

	http://localhost:8080/api/point/near/-123.01/49.4

### /api/points/near/lon/lat
returns all of the points that fall within a specified latitude, longitude, and radius in meters.

	http://localhost:8080/api/points/near/-123.01/49.4
	
### /api/points/property/gte/threshold
returns all of the points greater than or equal to a specified threshold for a given measurement property(e.g. co2, temperature, gpsfix, etc)

	http://localhost:8080/api/points/co2/480

### /api/points/property/range/low/high
returns all of the points within a specified range for a given measurement property(e.g. co2, temperature, gpsfix, etc)

	http://localhost:8080/api/points/co2/range/380/800

### /api/sensors/yyyy-mm-dd
returns all of the measured values for the specified date (yyyy-mm-dd). Dates are in YYYY-MM-DD format

	http://localhost:8080/api/points/time/2014-07-09


### /api/sensors/yyyy1-mm1-dd1/yyyy2-mm2-dd2
returns all of the measured values between date1 (yyyy1-mm1-dd1) and date2 (yyyy2-mm2-dd2). Dates are in YYYY-MM-DD format

	http://localhost:8080/api/points/time/2014-07-09/2014-07-12
	


