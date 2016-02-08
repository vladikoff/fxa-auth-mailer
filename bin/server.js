/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var restify = require('restify')
var config = require('../config')

var log = require('../log')('server')
var mailConfig = config.get('mail')
var dbConfig = config.get('db')

var P = require('bluebird')

// NOTE: Mailer is also used by fxa-auth-server directly with an old logging interface
// the legacy log module provides an interface to convert old logs to new mozlog logging.
var mailerLog = require('../log')('mailer')
var legacyMailerLog = require('../legacy_log')(mailerLog)
var Mailer = require('../mailer')(legacyMailerLog)
var DB = require('../lib/db')()


var verificationReminderConfig = config.get('verificationReminder')
var VerificationReminder = require('../lib/verification-reminder')()

P.all(
  [
    require('../translator')(config.get('locales')),
    require('../templates')()
  ]
  )
  .spread(
    function (translator, templates) {
      // configure the mailer
      var mailer = new Mailer(translator, templates, mailConfig)

      log.info('config', mailConfig)
      log.info('templates', Object.keys(templates))
      // TODO: fix config below
      log.info('db', config.get('httpdb'))

      // setup DB
      return DB.connect(config.get('httpdb'))
        .done(function (db) {
          // Start verification reminder checking
          if (verificationReminderConfig.enabled) {
            new VerificationReminder(mailer, db)
          } else {
            log.info('init', 'verification reminders not enabled - shutting down gracefully')
          }
        })

    }
  )
  .catch(
    function (err) {
      log.error('init', err)
      process.exit(8)
    }
  )