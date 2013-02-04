#!/usr/bin/env node
// FDoc
if(process.argv.length < 4){
	console.log("Usage: fdoc_js fdoc_dir out_html_dir");
	process.exit(-1);
}

var fdoc_dir = process.argv[3],
	out_dir = process.argv[4];

console.log("fdoc path: " + fdoc_dir);
console.log("out dir: " + out_dir);

// Load deps
var glob = require("glob"),
	path = require("path"),
	hogan = require("hogan.js"),
	fs = require("fs"),
	yaml = require('js-yaml');

var verbs = ['get', 'post', 'put', 'delete'];

function get_yaml(file){
	return yaml.load( fs.readFileSync(file).toString() );
}

function get_template(file){
	return hogan.compile(fs.readFileSync(file).toString())
}

function sortParams(endpoint, item){
	props = []
	for(k in endpoint[item + 'Parameters']['properties']){
		p = endpoint[item + 'Parameters']['properties'][k];
		p['key'] = k;
		props.push(p);
	}
	if(props.length > 0)
		props[props.length-1]['last'] = true;
	endpoint[item + 'Parameters']['properties'] = props;
	endpoint[item + 'Parameters']['type_is_' + endpoint[item + 'Parameters']['type']] = true;
}

// Copy Foundation
foundation = fs.readFileSync("./lib/foundation.min.css");
fs.writeFileSync(path.join(out_dir, "foundation.min.css"), foundation);

template = get_template("./lib/fdoc.mustache");
partials = {
	"property.mustache" : get_template("./lib/property.mustache"),
	"type.mustache" : get_template("./lib/type.mustache")
};

glob( path.join( fdoc_dir, "**", "*.fdoc.service" ), function(err, files){
	if(!err){
		files.forEach(function(file){
			service = get_yaml(file);
			console.log("Service " + service['name'] + " discovered. Documenting");

			service['path'] = path.dirname(file);


			service['short'] = file.split(path.sep);
			service['short'] = service['short'][ service['short'].length-1 ];
			service['short'] = service['short'].split( "." )[0];

			models = []
			for(k in service['models']){
				model = service['models'][k];

				props = [];
				for(k in model['properties']){
					p = model['properties'][k];
					p['key'] = k;
					props.push(p);
				}
				if(props.length > 0)
					props[props.length-1]['last'] = true;
				model['properties'] = props;

				model['key'] = k;
				models.push(model);
			}
			service['models'] = models;

			service['endpoints'] = [];
			glob( path.join(service['path'], "**", "*.fdoc" ), function(err, endpoints){
				endpoints.forEach(function(endpoint_f){
					endpoint = get_yaml(endpoint_f);

					sortParams(endpoint, "request");
					sortParams(endpoint, "response");
					for(k in endpoint['responseCodes']){
						endpoint['responseCodes'][k]['successful_' + endpoint['responseCodes'][k]['successful']] = true;
					}

					ep_path = endpoint_f.substring( service['path'].length, endpoint_f.length - ".fdoc".length );
					p = ep_path.split( path.sep );
					x = p[p.length-1].split("-");

					if( verbs.indexOf( p[p.length-1].toLowerCase() ) != -1 ){
						verb = p[p.length-1].toUpperCase();
					} else if( verbs.indexOf( x[x.length-1].toLowerCase() ) != -1 ){
						verb = x[x.length-1].toUpperCase();
						ep_path = ep_path.substring(0, ep_path.length - (verb.length+1));
					}
					console.log(verb, ep_path);

					endpoint['name'] = verb + ' ' + ep_path;
					service['endpoints'].push(endpoint);
				});

				console.log("Writing Documentation for " + service['name'] + "...");
				fs.writeFileSync(path.join(out_dir, service['short'] + ".html"), template.render({
					"service" : service
				}, partials));
			});
		});
	} else{
		console.error("Error: " + err);
	}
});