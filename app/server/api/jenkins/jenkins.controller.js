'use strict';

var _ = require('lodash');

var jenkins = require('../../helpers/jenkins');

var buildAPIURL = function(semester, job) {
  // hack to get around the jenkins api package
  var url = semester + '/' + job.project + '/' + encodeURIComponent(job.team);
  return url;
};

var getSonarURL = function(jenkinsJob, callback) {
  jenkins.api.job.get(jenkinsJob, {tree: 'builds[actions[url]]'}, function(err, sonar) {
    if (err) throw err;

    for (var i = 0; i < sonar.builds.length; i++) {
      var build = sonar.builds[i];
      if (build) {
        for (var j = 0; j < build.actions.length; j++) {
          var action = build.actions[j];
          if (action) {
            if (action.url) {
              return callback(err, action.url);
            }
          }
        }
      }
    }
    callback(err, '');
  });
};

exports.index = function(req, res) {
  res.json([]);
};

exports.job = function(req, res) {
  var jenkinsJob = buildAPIURL(req.semesterName, req.jobURL);
  jenkins.api.job.get(jenkinsJob, {tree: 'description,displayName,url,buildable,color,healthReport[*],lastBuild[*],lastSuccessfulBuild[*]'}, function(err, data) {
    if (err || !data) {
      res.status(404).json({msg: 'No job with that name.'});
    }

    getSonarURL(jenkinsJob, function(err, sonar) {
      res.json({
        info: {semester: req.semesterName, job: req.jobURL},
        jenkins: data,
        sonarqube: sonar
      });
    });
  });
};

exports.metrics = function(req, res) {
  var jenkinsJob = buildAPIURL(req.semesterName, req.jobURL);
  jenkins.api.job.get(jenkinsJob, {tree: 'lastBuild[number],lastSuccessfulBuild[number]'}, function(err, data) {
    if (err || !data) {
      res.status(404).json({msg: 'No job with that name.'});
    }
    var build = data.lastBuild.number;

    jenkins.api.build.get(jenkinsJob, build + '/dryResult', function(err, data) {
      if (err) {
        // there is no metric information for this
      }
      return res.json(data);
    });
  });
};

exports.jobParse = function(req,res,next,job) {
  console.log('Job: ' + job);
  req.jobURL = jenkins.parseRepoName(job);
  next();
};

exports.semesterParse = function(req,res,next,semester) {
  console.log('Sem: ' + semester);
  req.semesterName = jenkins.getSemester(semester);
  next();
};
