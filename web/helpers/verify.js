var express = require('express');
var winston = require('winston');

var github = function() {
    var handleEvent  = function(event, data) {
        // Handle the events we care about - https://developer.github.com/v3/activity/events/types
        switch (event) {
            case 'repository':
                repositoryEvent(data);
                break;
            case 'commit_comment':
            case 'fork':
            case 'pull_request':
                break;
        }

    };

    /**
     * Occurs when an event occurs on a repository. Currently only a create event.
     * @param data The data that was sent for the event.
     */
    var repositoryEvent = function (data) {
        if (data.action === "created") {
            winston.info("New repo created: " + data.repository.name);
            winston.info("Organization: " + data.organization.login);

        }
    };

    return {
        handleEvent: handleEvent
    }
};

module.exports = github();