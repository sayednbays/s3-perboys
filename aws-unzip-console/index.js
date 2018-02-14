const fetch = require('node-fetch');
const os = require('os');
const readline = require('readline');
const util = require('util');

//read line from terminal util
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

process.stdout.write('read zip file in s3 and exract it to another folder' + os.EOL);
rl.write('zip file location (e.g zips/test.zip):' + os.EOL);
let lines = [];
rl.on('line', (line) => {
    lines.push(line.trim());
    if (lines.length === 1) {
        process.stdout.write('save location: (e.g unzip/)' + os.EOL);
    }
    if (lines.length === 2) {
        //the post data for the api gateway
        //zip_file_key: the zip file location on S3
        //out_dir_key: unzip files save path for S3
        let postData = {
            operation: "unzip",
            params: { "zip_file_key": lines[0], "out_dir_key": lines[1] }
        };

        //call the api gateway
        fetch('https://eaqete8tn4.execute-api.us-east-2.amazonaws.com/test/s3', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
            //if unzip success
            if (res.ok) {
                process.stdout.write('unzip success' + os.EOL);
            }
            //if unzip failure
            else {
                process.stdout.write('unzip failure' + os.EOL);
            }
            return res.json();
        }).then(data => {
            // print the success or failure result
            process.stdout.write(util.format(data) + os.EOL);
        })
            .catch((error) => {
                process.stderr.write('unzip failure' + os.EOL);
                process.stderr.write(util.format(error));
                rl.close();
            });
    }
});
