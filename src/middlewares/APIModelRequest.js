"use strict";

var Middleware = require('expressway').Middleware;

class APIModelRequest extends Middleware
{
    get description() {
        return "If a model slug is given, checks if it exists in the model service"
    }

    method(request,response,next,app,extension)
    {
        let value = request.params.model;
        let model = app.models.slug(value);

        if (! model) {
            return response.api({message:`Model does not exist`}, 404);
        }

        if (extension.auth && model.expose === false && ! request.user) {
            return response.api({message:`Unauthorized`}, 401);
        }

        request.params.model = model;

        return next();
    }
}

module.exports = APIModelRequest;

