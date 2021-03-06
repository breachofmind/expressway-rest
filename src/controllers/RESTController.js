"use strict";

var expressway = require('expressway');
var Controller = expressway.Controller;
var Promise = expressway.Promise;

class RESTController extends Controller
{
    /**
     * Constructor.
     * @injectable
     * @param app Application
     */
    constructor(app)
    {
        super(app);

        this.description = "Handles all API requests";

        this.middleware({
            update:    ['APIAuth', 'APIModelRequest', 'APIModelById'],
            create:    ['APIAuth', 'APIModelRequest'],
            trash:     ['APIAuth', 'APIModelRequest', 'APIModelById'],
            trashMany: ['APIAuth', 'APIModelRequest', 'APIModelsByIds'],
            fetchOne:  ['APIModelRequest', 'APIModelById'],
            fetchAll:  ['APIModelRequest','APIPaging'],
            search:    ['APIModelRequest','APIPaging', 'APIModelSearch'],

        });
    }

    /**
     * Say Hello.
     * Provide an index of API objects.
     *
     * GET /api/v1/
     */
    index(request,response,next,url,app,api,currentUser)
    {
        var json = {
            message: api.title,
            currentUser: currentUser,
            index: {}
        };

        app.models.each((model) => {
            if (api.auth === false
                || (api.auth && model.expose == false && currentUser && currentUser.can([model.name,'read']))
                || model.expose == true) {
                json.index[model.name] = url.api(model.slug);
            }
        });

        app.emit('api.index', json);

        return json;
    }

    /**
     * Authenticate a user.
     *
     * POST /api/v1/auth
     */
    auth(request,response,next,auth,passport,log)
    {
        let redirectTo = request.query.forward || auth.successUri;
        let credentials = request.body;

        // If the user is already logged in, Log them out first.
        if (request.user) {
            log.warn('User logging out: %s', request.user.id);
            request.logout();
        }

        if (! credentials.username || ! credentials.password || credentials.username == "" || credentials.password == "") {
            return response.api(request.lang('auth.err_missingCredentials'), 400);
        }

        passport.authenticate('local', (err,user,info) =>
        {
            if (err) {
                return response.api(err, 500);
            } else if (! user) {
                return response.api(request.lang(info.message), 403);
            }

            request.logIn(user, err =>
            {
                if (err) {
                    return response.api(request.lang(info.message), 400);
                }

                // We are authenticated.
                return response.api({user:user, redirect:redirectTo}, 200);
            });

        })(request,response,next);
    }

    /**
     * Fetch the localization keys.
     *
     * GET /api/v1/locale
     */
    locale(request,response,next,locale,config)
    {
        if (app.config.cache) {
            response.setHeader('Cache-Control', 'public, max-age=' + config('cache_max_age', 7*24*60*60));
        }
        let loc = request.locale.toLowerCase();

        return {
            locale: loc,
            keys: locale.getLocale(loc)
        };
    }

    /**
     * Fetches an object by ID.
     *
     * GET /api/v1/{model}/{id}
     */
    fetchOne(request,response,next)
    {
        return response.api(request.params.object, 200, {
            model: request.params.model.name
        })
    }


    /**
     * Fetches an array of objects, with pagination.
     *
     * GET /api/v1/{model}
     */
    fetchAll(request,response,next,app)
    {
        let model = request.params.model;
        let paging = request.params.paging;

        // Find the total record count first, then find the range.
        return model.count(paging.filter).exec().then(function(count) {

            paging.total = count;

            var promise = model
                .find(paging.filter)
                .sort(paging.sort)
                .limit(paging.limit)
                .populate(model.populate)
                .exec();

            // After finding the count, find the records.
            return promise.then(data => {

                paging.setNext(data);

                return response.api(data,200, {
                    pagination: paging,
                    model: model.name
                });

            }, err => {

                // model.find() error
                return response.api(err,400);
            });

        }, err => {

            // model.count() error
            return response.api(err,400);
        });
    }


    /**
     * Initiate a new search.
     *
     * POST /api/{model}/search
     */
    search(request,response,next,app)
    {
        return request.params.query.exec().then(data =>
        {
            return response.api(data,200, {search:request.body});

        }, err => {

            return response.api(err,400);
        });
    }


    /**
     * Update a model.
     *
     * PUT /api/{model}/{id}
     */
    update(request,response,next,currentUser)
    {
        let object = request.params.object;
        let model = request.params.model;

        // I need to have permission to update this thing.
        // Pass the current object and the update request.
        let test = currentUser.allowed([model.name,'update'], {
            object: object,
            update: request.body
        });

        if (test.failed) {
            return response.api({message:test.localize(request)}, 403);
        }

        if (request.body._id) delete request.body._id; // Mongoose has problems with this.

        request.body.modified_at = Date.now();

        return object
            .update(request.body, {new:true})
            .populate(model.populate)
            .exec()
            .then(data => {

                return response.api(data,200,apiMessage(request, 'updated', model.singular));

            }, err => {

                return response.api(err,400);
            });
    }


    /**
     * Create a new model.
     *
     * POST /api/{model}
     */
    create(request,response,next,currentUser)
    {
        let model = request.params.model;

        // I need to have permission to create this thing.
        // Pass in the request body which should contain creation properties.
        let test = currentUser.allowed([model.name,'create'], request.body);
        if (test.failed) {
            return response.api({message:test.localize(request)}, 403);
        }
        // If this object is managed, attached user id to the managed key.
        if (model.managed) {
            request.body[model.managed] = currentUser.id;
        }

        return model.create(request.body).then(data =>
        {
            return response.api(data,200, apiMessage(request, 'created', model.singular));

        }, err => {

            return response.api(err,400);

        });
    }

    /**
     * Deletes an object by ID.
     *
     * DELETE /api/{model}/{id}
     */
    trash(request,response,next,currentUser)
    {
        let object = request.params.object;
        let model = request.params.model;

        // I need to have permission to delete this thing.
        let test = currentUser.allowed([model.name,'delete'], object);
        if (test.failed) {
            return response.api({message:test.localize(request)}, 403);
        }

        return model.delete({[model.primaryKey]: object[model.primaryKey]}).then(results =>
        {
            let data = {
                results: results,
                objectId : object[model.primaryKey]
            };
            return response.api(data,200,apiMessage(request, 'deleted', model.singular));

        }, err => {

            return response.api(err,400);

        });
    }

    /**
     * Deletes multiple objects given an array of IDs.
     *
     * DELETE /api/{model}
     */
    trashMany(request,response,next,currentUser)
    {
        // The request
        let objects = request.params.objects;
        let model = request.params.model;
        let json = {
            requested: request.body.ids,
            deleted: [],
            errored: [],
            errors: {},
        };

        let promises = objects.map(object =>
        {
            // I need to have permission to delete this thing.
            let id = object[model.primaryKey];
            let test = currentUser.allowed([model.name,'delete'], object);
            if (test.failed) {
                json.errored.push(id);
                json.errors[id] = {status: 403, message: test.localize(request)};
                return true;
            }
            return model.delete({[model.primaryKey]: id}).then(results =>
            {
                // Successfully deleted.
                json.deleted.push(id);

            }, err => {

                json.errored.push(id);
                json.errors[id] = {status:400, message:err.message}
            });
        });

        return Promise.all(promises).then(result =>
        {
            let msgData = [json.deleted.length, json.errored.length, json.requested.length, model.plural];
            let message = request.lang('api.deletionError', msgData);
            let statusCode = 400;

            if (json.requested.length === json.deleted.length) {
                // The operation was a total success. High five.
                message = request.lang('api.deletedMany', msgData);
                statusCode = 200;

            } else if (json.deleted.length > 0 && json.errored.length > 0) {
                // The operation worked on some of them, but not all.
                message = request.lang('api.deletedManyWithErrors', msgData);
                statusCode = 200;
            }

            return response.api(json,statusCode,{message:message});
        })
    }
}

/**
 * Alias for creating a localized response message
 * @param request
 * @param key
 * @param arg
 * @returns {{message: *}}
 */
function apiMessage(request,key,arg)
{
    return {message: request.lang(`api.${key}`,arg) };
}

module.exports = RESTController;