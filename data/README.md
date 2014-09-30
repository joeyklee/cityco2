Batch import to mongoDB

	sh import.sh 


Don't forget then to create once a geospatial index for all collections e.g.

	mongo
	use fatalatour
	db.incidents.ensureIndex( {"geometry": "2dsphere"} )
	db.infos.ensureIndex( {"geometry": "2dsphere"} )
