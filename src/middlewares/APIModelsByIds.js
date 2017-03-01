"use strict";

var Middleware = require('expressway').Middleware;

class APIModelsByIds extends Middleware
{
    get description() {
        return "Given an array of ids, return only the given models"
    }

    method(request,response,next)
    {
        let ids = request.body.ids;
        let model = request.params.model;

        if (!ids || !ids.length) {
            return response.api({message: "No Object IDs given"}, 400);
        }
        let query = {[model.primaryKey]: {
            $in: ids
        }};

        // Find the objects and attach them to the request.
        model.find(query).then(result => {
            if (! result || ! result.length) {
                return response.api({message:`No models found`, slug:model.slug, ids:ids }, 404);
            }
            request.params.objects = result;
            next();

        }, err => {
            response.api(err,400);
        });
    }
}

module.exports = APIModelsByIds;

