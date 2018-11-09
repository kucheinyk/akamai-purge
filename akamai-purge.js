let fs = require('fs');
let https = require('https');

// Collecting arguments
let args = {};
process.argv.forEach((val, index, array) => {
	if(index<2) {
		return;
	}
	let chunk = /^(.+?):(.+)$/.exec(val);
	args[chunk[1]] = chunk[2];
});

// Validating arguments
if(!args.user) {
	console.log('Required params missing: user:<username>');
	process.exit()
}
if(!args.pass) {
	console.log('Required params missing: pass:<password>');
	process.exit();
}

if(!args.prefix) {
	console.log('Required params missing: prefix');
	process.exit();
}

// List all files in a directory in Node.js recursively in a synchronous fashion
let readDirectory = (rootPath, relPath, filelist) => {
	filelist = filelist || [];
	relPath = relPath || '';
	let files = fs.readdirSync(rootPath + relPath);
	files.forEach(file => {
		// if starts from dot "." - ignore
		if(/^\./.test(file)) {
			return;
		}
		if (fs.statSync(rootPath + relPath + '/' + file).isDirectory()) {
			filelist = readDirectory(rootPath, relPath + '/' + file, filelist);
		} else {
			filelist.push(relPath + '/' + file);
		}
	});
	return filelist;
};

let postToAkamai = (data) => {
	let postData = JSON.stringify(data);

	let req = https.request({
		hostname: 'api.ccu.akamai.com',
		path: '/ccu/v2/queues/default',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(postData),
			'Authorization': 'Basic ' + (new Buffer(args.user + ':' + args.pass)).toString('base64')
		}
	}, res => {
		let dataStr = '';
		res.on('data', chunk => {
			dataStr += chunk;
		});
		res.on('end', () => {
			try {
				let data = JSON.parse(dataStr);
				for (let key in data) {
					console.log(key + ': ' + data[key]);
				}
			} catch(e) {
				console.log('ERROR:');
				console.log(dataStr);
			}
		});
	});

	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});

	// write data to request body
	req.write(postData);
	req.end();
}

// Get directory from arguments or use local directory
let dir = args.read || __dirname;

// Read directory
console.log("READING: " + dir);
let files = readDirectory(dir);

if(!files || !files.length) {
	console.log('No files read, nothing to purge');
	process.exit();
}

// Prepend prefix
let urls = files.map(file => args.prefix + file);

console.log('PURGING URLS:');
urls.forEach(url => console.log(url));

console.log(' . . . ');

postToAkamai({
	objects: urls
});

