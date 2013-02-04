# FDoc for Node

FDoc is written by Square https://github.com/square/fdoc

I didn't want to learn Ruby, so I made it in NodeJS.

## Quick Setup

	npm install -g fdoc

That's it! Now you can use it:
	
	fdoc_js directory_of_fdoc.service_files output_html_dir

(p.s more documentation soon!)

## Extra Features

In your `.fdoc.service` file you can have models:

	models:
	 loan:
	  description: A loan on the system
	  properties:
	   id:
	    type: int
	    description: unique id
	   equipment:
	    type: object
	    model: equipment
	    description: piece of equipment associated with the loan

Which are used like so:

	responseParameters:
	 type: json
	 properties:
	  results:
	   type: array
	   model: loan

Also it is not as strict, so most things will work.

Plus, you may have noticed the `type` parameter. That formats the example. You can choose:

* json
* get (?g=4&ee=f)
* form (g=4&ee=f)
* (want more, add it to `lib/type.mustache`)

## Credits

* Square for making fdoc
* Foundation CSS by ZURB which made the HTML generated look nice

## License

GPL v3 - http://www.tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3)