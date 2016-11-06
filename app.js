'use strict';

require( 'dotenv' ).config( {silent: true} );
//call dotenv to load environment variablesfrom .env file

var express = require( 'express');
//call express framework to create our web app
var bodyParser = require( 'body-parser');
//call bodyParser to create json objects
var Watson = require( 'watson-developer-cloud/conversation/v1');
//call conversation api

var uuid = require('uuid')
//call uuid to generate universally unique identifier
var vcapServices = require('vcap_services');
var basicAuth = require('basic-auth-connect');
var logs = null;
var app = express();

app.use( express.static( './public' ) );
app.use( bodyParser.json() );

var conversation = new Watson( {
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-09-20',
  version: 'v1'
} );

app.post( '/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };
  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      payload.context = req.body.context;
    }
  }

  conversation.message( payload, function(err, data) {
    if ( err ) {
      return res.status( err.code || 500 ).json( err );
    }
    return res.json( updateMessage( payload, data ) );
  } );
} );

function updateMessage(input, response) {
  var responseText = null;
  var id = null;
  if ( !response.output ) {
    response.output = {};
  } else {
    if ( logs ) {
      id = uuid.v4();
      logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
    }
    return response;
  }
  if ( response.intents && response.intents[0] ) {
    var intent = response.intents[0];
    if ( intent.confidence >= 0.75 ) {
      responseText = 'Não entendi que sua intenção é' + intent.intent;
    } else if ( intent.confidence >= 0.5 ) {
      responseText = 'Acho que sua intenção é ' + intent.intent;
    } else {
      responseText = 'Não entendi sua intenção';
    }
  }
  response.output.text = responseText;
  if ( logs ) {
    id = uuid.v4();
    logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
  }
  return response;
}

module.exports = app;
