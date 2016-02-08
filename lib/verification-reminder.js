/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var log = require('../log')('verification-reminder')

var SQSReminder = require('./reminders/enqueue')()
var verificationReminderQueue = new SQSReminder()

module.exports = function () {
  var SQSReminderReceiver = require('./sqs-reminder')()

  return function start(mailer, db) {

    function handleReminder(message) {
      log.debug('handleReminder', message)

      return db.emailRecord(message.email)
        .then(function (account) {
          if (! account.emailVerified) {
            mailer.verificationReminderEmail(message, message.reminderType)
            // TODO: queue up second email if we need to send it again.
            // TODO: check createdAt date
            message.del()

            // stop after the second reminder
            if (message.reminderType !== 'secondReminder') {
              verificationReminderQueue.enqueue({
                email: message.email,
                // TODO: remove the UID?
                uid: message.uid,
                code: message.code,
                acceptLanguage: message.acceptLanguage,
                reminderType: 'secondReminder'
              })
            }

          }
      })
    }

    var verifyQueue = new SQSReminderReceiver()
    verifyQueue.on('data', function (message) {
      process.nextTick(function() {
        handleReminder(message)
      })
    })
    verifyQueue.start()
    return verifyQueue
  }
}