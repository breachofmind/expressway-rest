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
        let search = request.body;
        let model = request.params.model;

        request.params.query = model
            .find(search.where)
            .sort(search.sort)
            .limit(search.limit || config('limit',50))
            .populate(search.populate || model.populate);

        // Based on permissions, only show models the user owns.
        if(extension.auth && currentUser.cannot(model,'manage')) {
            request.params.query.where(model.managed).equals(currentUser.id);
        }

        next();
    }
}

module.exports = APIModelSearch;

