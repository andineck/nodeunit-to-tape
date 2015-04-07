# nodeunit-to-tape

nodeunit to tape test converter


## install

```bash
npm install nodeunit-to-tape
```

## use

the converter can be used from the commandline or from node.js


### command line
```bash
node index.js <nodeunit source file> <tape output file>
```

### node.js
```js
var n2t = require('nodeunit-to-tape');
n2t(inputPath, outputPath);
```

## note
the converter may or may not work, depending on the code style of your nodeunit test.
please fork and modify it according to your needs.

## license
MIT