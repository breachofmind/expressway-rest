"use strict";

var Middleware = require('expressway').Middleware;

class APIModelById extends Middleware
{
    get description() {
        return "If an ID and model is given, looks up the model in the database"
    }

    method(request,response,next,utils)
    {
        let id    = request.params.id;
        let model = request.params.model;

        model.findById(id).exec().then(result => {
            if (! result) {
                return response.api({message:`Model does not exist`, slug:model.slug, id:id }, 404);
            }
            request.params.object = result;
            next();

        }, err => {
            response.api(err,400);
        });
    }
}

module.exports = APIModelById;

