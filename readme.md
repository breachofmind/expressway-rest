# Expressway REST

Provides a RESTful JSON api to your Expressway app.

## Usage

Install with `npm` and add it to your application instance.
This extension depends on the `expressway-auth` extension, so be sure to add that, too.
```bash
npm install breachofmind/expressway-auth --save
npm install breachofmind/expressway-rest --save
```

```javascript
// index.js
var expressway = require('expressway');
var AuthExtension = require('expressway-auth');
var APIExtension = require('expressway-rest');

var app = expressway(config);

app.use(APIExtension)
```

```
// Your root extension class
class RootExtension extends Extension
{
    constructor(app) 
    {
        app.use([
        // ...
        require(
        ])    
    }
}
```