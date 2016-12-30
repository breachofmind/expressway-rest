"use strict";

var Middleware = require('expressway').Middleware;

class APIModelRequest extends Middleware
{
    get description() {
        return "If a model slug is given, checks if it exists in the model service"
    }

    method(request,response,next,app,extension)
    {
        let model;
        let value = request.params.model;

        try {
            model = app.models.slug(value);
        } catch (err) {
            return response.api({message:"Model does not exist", slug:value}, 404);
        }

        if (extension.auth && model.expose === false && ! request.user) {
            return response.api({message:`Unauthorized`}, 401);
        }

        request.params.model = model;

        return next();
    }
}

module.exports = APIModelRequest;

