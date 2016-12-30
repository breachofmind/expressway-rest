"use strict";

var Middleware = require('expressway').Middleware;

class APIAuth extends Middleware
{
    get description() {
        return "Checks if the user is logged in"
    }

    method(request,response,next,extension)
    {
        if (extension.auth && ! request.user) {
            return response.api({message:`You are not authorized to perform this operation`}, 401);
        }
        return next();
    }
}

module.exports = APIAuth;