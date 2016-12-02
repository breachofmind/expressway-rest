"use strict";

var _           = require('lodash');
var Expressway  = require('expressway');
var utils       = Expressway.utils;
var app         = Expressway.app;

class RESTController extends Expressway.Controller
{
    get description() {
        return "Handles all API requests"
    }

    constructor(app)
    {
        super(app);

        this.middleware({
            update:    ['APIAuth', 'APIModelRequest', 'APIModelById'],
            create:    ['APIAuth', 'APIModelRequest'],
            trash:     ['APIAuth', 'APIModelRequest', 'APIModelById'],
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
    index(request,response,next,modelService,url,app,config,APIModule)
    {
        var json = {
            message: APIModule.apiName,
            currentUser: request.user,
            index: {}
        };

        modelService.each(model => {
            if ((model.expose == false && request.user) || model.expose == true) {
                json.index[model.name] = url(config('api_baseuri')+'/'+model.slug);
            }
        });

        app.emit('rest.index', json.index);

        return json;
    }

    /**
     * Fetch the localization keys.
     *
     * GET /api/v1/locale
     */
    locale(request,response,next,localeService,config)
    {
        if (app.config.cache) {
            response.setHeader('Cache-Control', 'public, max-age=' + config('cache_max_age', 7*24*60*60));
        }
        let locale = request.locale.toLowerCase();

        return {
            locale: locale,
            keys: localeService.getLocale(locale)
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
                .find       (paging.filter)
                .sort       (paging.sort)
                .limit      (paging.limit)
                .populate   (model.populate)
                .exec();

            // After finding the count, find the records.
            return promise.then(function(data) {

                paging.setNext(data);

                return response.api(data,200, {
                    pagination: paging,
                    model: model.name
                });

            }, function(err) {

                // model.find() error
                return response.apiError(err);
            });

        }, function(err) {

            // model.count() error
            return response.apiError(err);
        });
    }


    /**
     * Initiate a new search.
     *
     * POST /api/{model}/search
     */
    search(request,response,next,app)
    {
        return request.params.query.exec().then(function(data)
        {
            return response.api(data,200, {search:request.body});

        }, function(err) {

            return response.apiError(err);
        });
    }


    /**
     * Update a model.
     *
     * PUT /api/{model}/{id}
     */
    update(request,response)
    {
        let object = request.params.object;
        let model = request.params.model;

        if (request.body._id) delete request.body._id; // Mongoose has problems with this.

        request.body.modified_at = Date.now();

        return object
            .update(request.body, {new:true})
            .populate(model.populate)
            .exec()
            .then(function(data) {

                return response.api(data,200);

            }, function(err){

                return response.apiError(err);
            });
    }


    /**
     * Create a new model.
     *
     * POST /api/{model}
     */
    create(request,response)
    {
        return request.params.model.create(request.body).then(function(data)
        {
            return response.api(data,200);

        }, function(err) {

            return response.apiError(err);

        });
    }

    /**
     * Deletes an object by ID.
     *
     * DELETE /api/{model}/{id}
     */
    trash(request,response)
    {
        let object = request.params.object;
        let model = request.params.model;

        return model.remove({_id: object.id}).then(function(results) {
            var data = {
                results: results,
                objectId : object.id
            };
            return response.api(data,200);

        }, function(err) {

            return response.apiError(err);

        });
    }
}

module.exports = RESTController;