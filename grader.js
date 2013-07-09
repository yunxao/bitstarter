#!/usr/bin/env node
/*
Automatically grade fiorts.checkHtmlFile = checkHtmlFile;
}les for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";


var assertUrl = function (url) {
	var url_string = url.toString();
	return url_string;
}	

checkHtmlFileFromUrl_2  = function(htmlfile, checksfile) {
    $ = cheerio.load(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};
var checkHtmlFileFromUrl = function(url,checks){
	var fun = function (request,result){
		if (request instanceof Error){
			webContent = "!";
			console.log("the url \"" + url + "\" is not a correct url");
			process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
		}else{
			var webContent = request;
			var checkJson = checkHtmlFileFromUrl_2(webContent,checks);
			var outJson = JSON.stringify(checkJson, null, 4);
			console.log(outJson);
		}
	}
	rest.get(url).on('complete',fun);
	return;
}


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), "")
	    .option('-u, --url <url_html_file>', 'Url to index.html' , clone(assertUrl), "")
        .parse(process.argv);
        
    
    if (program.file != "" && program.url != ""){
		console.log("--url and --file options are incompatibles");
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	if (program.file == "" && program.url == ""){
		program.file = HTMLFILE_DEFAULT;
	}
	var checkJson;
	if (program.file != ""){
		checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	} else { //if (program.url != "") this condition is always true
		checkJson = checkHtmlFileFromUrl(program.url, program.checks);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

