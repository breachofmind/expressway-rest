"use strict";

var Middleware = require('expressway').Middleware;

const JSONAPI_MIME = "application/vnd.api+json";

class APIRequest extends Middleware
{
    get description() {
        return "Instructs the server to respond with json and cache requests if necessary"
    }

    /**
     * @link http://jsonapi.org/format/#content-negotiation-servers
     */
    method(request,response,next)
    {
        if (! request.accepts(JSONAPI_MIME)) {
            return 415; // Unsupported media type
        } else if (request.accepts("*/*") && this.app.env == ENV_PROD) {
            return 406; // Not Acceptable, only if requesting in production.
        }
        response.set('Content-Type', JSONAPI_MIME);
        return next();
    }
}

module.exports = APIRequest;