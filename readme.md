# Expressway REST

Provides a RESTful JSON API to your Expressway app.

## Usage

Install with `npm` or `yarn`:
```bash
npm install breachofmind/expressway-rest --save

yarn add breachofmind/expressway-rest
```

After initializing your app with `expressway()`, add using `app.use()`.
```javascript
var expressway = require('expressway');
var APIExtension = require('expressway-rest');

var app = expressway(config);

app.use(APIExtension)
```
If you're using an extension class, call `app.use()` from the constructor.
```
// Your root extension class
class RootExtension extends Extension
{
    constructor(app) 
    {
        app.use(require('expressway-rest'))    
    }
    
    boot(app,api) 
    {
        // Configure after the extension boots.
        api.base = "/my/api";
    }
}
```

## Configuration
By default, the API does not require user authentication. Any models you have declared
can be searched, created, updated or deleted via the RESTful interface.

To configure, first add the extension to your app:
```javascript
app.use(require('expressway-rest'));
```
Then, set the configuration options.
```javascript

var api = app.extensions.get('APIExtension');

// Or, by the alias:
//var api = app.extensions.get('api');

// Turn on user authentication. This requires a user model.
api.auth = true;

// Change the API base url.
// By default, it's "/api/v1".
api.base = "/my/api";

// Change the API name, which displays at the index.
api.apiName = "CoolAPI v.8.0";
```

## Services
When this extension is created, a service is also created. 
So, it can be injected into injectable functions and methods.

```javascript
// Returns the api base url.
// @injectable
function injectableFunction(api) {
    console.log(api.base);
}
app.call(injectableFunction); // "/api/v1"
```

## API Endpoints
This JSON API has the standard __CRUD__ pattern (Create, Read, Update, Delete), 
in addition to Search and Locale.

- __API__ - the API base url, ie "/api/v1"
- __SLUG__ - the model name slug, ie "user"
- __ID__ - the model object id, ie "581a0612cf757210f99cfdd7"

### Methods
- `create` - POST API/SLUG - Create a model.
- `fetchAll` - GET API/SLUG - Get all models (range-based pagination)
- `fetchOne` - GET API/SLUG/ID - Get one model.
- `search` - POST API/SLUG/search - Search for a model given the POST body (see mongoose options)
- `update` - PUT API/SLUG/ID - Update a model.
- `delete` - DELETE API/SLUG/ID - Delete a model.
- `locale` - GET API/locale - Gets localization keys for current locale.

### Server Response
This API somewhat follows the [JSON API architecture guidelines](http://jsonapi.org/). A typical response will look like this:

`GET /api/v1/user/581a0612cf757210f99cfdd7`
```json
{  
   "statusCode":200,
   "message":"OK",
   "method":"GET",
   "user":"581a0612cf757210f99cfdd7",
   "model":"User",
   "data":{  
      "$title":"admin@test.com",
      "$url":"http://localhost:8081/api/v1/user/581a0612cf757210f99cfdd7",
      "created_at":"2016-11-02T15:28:18.425Z",
      "email":"admin@test.com",
      "failures":0,
      "first_name":"Jake",
      "id":"581a0612cf757210f99cfdd7",
      "last_name":"Root",
      "modified_at":"2016-11-02T15:28:18.425Z",
      "name":"Jake Root",
      "reset_token":"",
      "roles":[]
   }
}
```

`fetchAll` responses return arrays of data, plus pagination information.

`GET /api/v1/media`
```json
{
    "statusCode": 200,
    "message": "OK",
    "method": "GET",
    "user": "581a0612cf757210f99cfdd7",
    "pagination": {
        "count": 4,
        "total": 4,
        "limit": 10000,
        "filter": null,
        "sort": {
            "id": 1
        },
        "next": null
    },
    "model": "Media",
    "data": [
        {
            "$title": "Lee",
            "$url": "http://localhost:8081/api/v1/media/5865401891b5ff10d39832c3",
            "alt_text": null,
            "caption": null,
            "created_at": "2016-12-29T16:55:52.881Z",
            "etag": null,
            "file_name": "lee.jpg",
            "file_type": "image/jpg",
            "id": "5865401891b5ff10d39832c3",
            "modified_at": "2016-12-29T16:55:52.881Z",
            "title": "Lee"
        },
        {
            "$title": "Ash",
            "$url": "http://localhost:8081/api/v1/media/5865401891b5ff10d39832c4",
            "alt_text": null,
            "caption": null,
            "created_at": "2016-12-29T16:55:52.881Z",
            "etag": null,
            "file_name": "ash.jpg",
            "file_type": "image/jpg",
            "id": "5865401891b5ff10d39832c4",
            "modified_at": "2016-12-29T16:55:52.881Z",
            "title": "Ash"
        }
    ]
}
```

### Server Error Response
Errors generally look like this:

`GET /api/v1/media/asd`
```json
{
    "statusCode": 400,
    "message": "Bad Request",
    "method": "GET",
    "user": "581a0612cf757210f99cfdd7",
    "error": 
    {
        "message": "Cast to ObjectId failed for value \"asd\" at path \"_id\" for model \"Media\"",
        "name": "CastError",
        "stringValue": "\"asd\"",
        "kind": "ObjectId",
        "value": "asd",
        "path": "_id"
    }
}
```
