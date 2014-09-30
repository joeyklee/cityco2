Batch import to mongoDB

	sh import.sh 


Don't forget then to create once a geospatial index for all collections e.g.

	mongo
	use co2
	db.points.ensureIndex( {"geometry": "2dsphere"} )
