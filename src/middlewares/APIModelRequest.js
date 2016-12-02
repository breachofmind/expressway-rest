"use strict";

var Expressway = require('expressway');

class APIModelRequest extends Expressway.Middleware
{
    get type() {
        return "APIModule"
    }
    get description() {
        return "If a model slug is given, checks if it exists in the model service"
    }

    method(request,response,next,modelService)
    {
        var value = request.params.model;
        var model = modelService.bySlug(value);

        if (! model) {
            return response.api({error:`Model does not exist`}, 404);
        }

        if (model.expose == false && ! request.user) {
            return response.api({error:`Unauthorized`}, 401);
        }

        request.params.model = model;

        return next();
    }
}

module.exports = APIModelRequest;

