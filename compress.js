const fs = require('fs');
const archiver = require('archiver');

const manifest = require('./manifest');

if (!fs.existsSync(`releases/${process.env.BROWSER}`)) {
    fs.mkdirSync(`releases/${process.env.BROWSER}`, { recursive: true });
}

// create a file to stream processArchive data to.
const output = fs.createWriteStream(`releases/${process.env.BROWSER}/${manifest.version}.zip`);
const compress = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
});

// listen for all processArchive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
    console.log(compress.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
    console.log('Data has been drained');
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
compress.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
});

// good practice to catch this error explicitly
compress.on('error', function(err) {
    throw err;
});

// pipe processArchive data to the file
compress.pipe(output);

// append files from a sub-directory, putting its contents at the root of processArchive
compress.directory(`${__dirname}/build/${process.env.BROWSER}/prod`, false);

// finalize the processArchive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
compress.finalize();
