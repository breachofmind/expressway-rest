"use strict";

var Middleware = require('expressway').Middleware;

class APINotFound extends Middleware
{
    get description() {
        return "Sends a JSON-encoded not found"
    }

    method(request,response,next)
    {
        return response.api({message:"Not Found"}, 404);
    }
}

module.exports = APINotFound;