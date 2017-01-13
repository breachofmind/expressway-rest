"use strict";

var Middleware = require('expressway').Middleware;

/**
 * Manipulates a search for models, given the logged in user.
 * This middleware should provide the rules of a user's search.
 * ie. One user can only see items they own, other users can see all items.
 */
class APIModelSearch extends Middleware
{
    get description() {
        return "Manipulates a user's search results based on the type of user"
    }

    method(request,response,next,config,currentUser,extension)
    {
        let model = request.params.model;

        if (! request.body.where) request.body.where = {};
        if (! request.body.sort) request.body.sort = model.range;
        if (! request.body.populate) request.body.populate = model.populate;
        if (! request.body.limit) request.body.limit = config('limit',50);

        let search = request.body;

        // Based on permissions, only show models the user owns.
        if(extension.auth && model.managed && currentUser.cannot([model.name,"manage"])) {
            search.where[model.managed] = currentUser.id;
        }
        let query = model
            .find(search.where)
            .sort(search.sort)
            .limit(search.limit)
            .populate(search.populate);

        request.params.query = query;

        next();
    }
}

module.exports = APIModelSearch;

