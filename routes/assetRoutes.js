var express = require('express'),
	router = express.Router();
var cartodbClient = require('../cartodbClient');

router
.all(function(req,res,next){
	console.log(req.method)
})
.get('/',function(req,res,next){
	var query = "SELECT * FROM {table}";

	cartodbClient.query(query,
		{table:'tdi_assets'},function(err,data){
			if(err){
				res.status(400).send(err);
			}else{
				console.log('SUCCESSFUL GET /asset');
				//flatten response
				data.features.forEach(function(feature){
					for(var key in feature.properties){
						feature[key] = feature.properties[key];
						delete feature.properties[key];
					}
					feature.assetType = feature.type;
					feature.type = 'asset';
				});


				res.json(data.features);
			}
		});
})
.post('/',function(req,res,next){
	var loc = req.body.geometry.coordinates;

	console.log(typeof req.body.subtype);

	var query = "INSERT INTO tdi_assets (city,the_geom,name,comment,type,employer,employee,parking,updated_at,address,contact, subtype, activating) "
		+"VALUES ('"
		+ req.body.city + "',"
		+ "ST_GeomFromText('POINT("+loc[0]+" "+loc[1]+")',4326)" + ",'"
		+ req.body.name + "','"
		+ req.body.comment + "','"
		+ req.body.assetType + "',"
		+ req.body.employer + ","
		+ req.body.employee + ","
		+ req.body.parking + ",'"
		+ (new Date()).toISOString() + "','"
		+ req.body.address + "','"
		+ req.body.contact + "','" 
		+ req.body.subtype + "'," 
		+ req.body.activating +
		") RETURNING cartodb_id";

	// var query ="INSERT INTO tdi_assets (city) VALUES ('PITTSFIELD') RETURNING cartodb_id";
	console.log(query);
	cartodbClient.query(query,function(err,data){
			if(err){ 
				console.log(err);
				res.status(500).send(err);
			}
			else{
				console.log('SUCCESSFULLY POST');
				var newID = data.rows[0].cartodb_id; //acquires new cartodb_id, send it back
				var response = req.body;
				response.cartodb_id = newID;

				res.json(response);
			}
		});
})
.put('/:id',function(req,res,next){
	console.log('PUT REQUEST TO /asset');
	console.log(req.body);

	var query = "UPDATE {table} SET comment='" 
		+ req.body.comment + "', address='"
		+ req.body.address + "', contact='"
		+ req.body.contact + "', employee="
		+ req.body.employee + ", parking="
		+ req.body.parking +
		" WHERE cartodb_id=" + req.params.id;

	cartodbClient.query(query,{table:'tdi_assets'},function(err,data){
		if(err){
			console.log('ERROR UPDATE TO ASSET');
			console.log(query);
			res.status(400).send(err);
		}else{
			console.log('SUCCESSFUL UPDATE TO ASSET '+req.params.id);
			res.json(req.body);
		}
	});

})
.delete('/:id',function(req,res,next){
	console.log('DELETE REQUEST TO /asset');
	console.log(req.body);

	var query = "DELETE FROM {table} WHERE cartodb_id=" + req.params.id;

	cartodbClient.query(query,{table:'tdi_assets'},function(err,data){
		if(err){
			res.send(err);
		}else{
			console.log('SUCCESSFUL DELETE TO ASSET ' + req.params.id);
			console.log(req.body);
			res.json(req.body);
		}
	});
})

module.exports = router;