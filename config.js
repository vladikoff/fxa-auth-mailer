/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')

var convict = require('convict')

var conf = convict({
  env: {
    doc: 'The current node.js environment',
    default: 'prod',
    format: [ 'dev', 'test', 'stage', 'prod' ],
    env: 'NODE_ENV'
  },
  port: {
    env: 'MAILER_PORT',
    format: 'port',
    default: 10136
  },
  db: {
    backend: {
      default: 'httpdb',
      env: 'DB_BACKEND'
    }
  },
  httpdb: {
    url: {
      doc: 'database api url',
      default: 'http://127.0.0.1:8000',
      env: 'HTTPDB_URL'
    }
  },
  logging: {
    app: {
      default: 'fxa-auth-mailer'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka'
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info'
    },
    debug: {
      env: 'LOG_DEBUG',
      default: false
    }
  },
  locales: {
    default: ['en', 'de'],
    doc: 'Available locales',
    format: Array
  },
  defaultLanguage: {
    doc: 'Default locale language',
    format: String,
    default: 'en'
  },
  verificationReminder: {
    enabled: {
      doc: 'set to true to enable checking the verification reminder queue',
      format: Boolean,
      env: 'VERIFICATION_REMINDER_ENABLED',
      default: false
    },
    queueRegion: {
      doc: 'The region where the queues live, most likely the same region we are sending email e.g. us-east-1, us-west-2',
      format: String,
      env: 'VERIFICATION_REMINDER_REGION',
      default: ''
    },
    queueUrl: {
      doc: 'The bounce queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
      format: String,
      env: 'VERIFICATION_REMINDER_QUEUE_URL',
      default: ''
    },
    visibilityTimeout: {
      default: 43200,  // (in seconds - from 0 to 43200 - maximum 12 hours) for the message's visibility timeout.
      doc: 'A period of time during which SQS prevents other consuming components from receiving and processing that message',
      format: Number
    }
  },
  mail: {
    host: {
      doc: 'The ip address the server should bind',
      default: '127.0.0.1',
      format: 'ipaddress',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: 'The port the server should bind',
      default: 9999,
      format: 'port',
      env: 'PORT'
    },
    secure: {
      doc: 'set to true to use a secure connection',
      format: Boolean,
      env: 'MAIL_HTTPS_SECURE',
      default: false
    },
    sender: {
      doc: 'email address of the sender',
      default: 'accounts@firefox.com',
      env: 'SMTP_SENDER'
    },
    verificationUrl: {
      doc: 'Verify email url',
      format: String,
      default: 'https://accounts.firefox.com/verify_email',
      env: 'VERIFY_URL',
      arg: 'verify-url'
    },
    passwordResetUrl: {
      doc: 'Reset password url',
      format: String,
      default: 'https://accounts.firefox.com/complete_reset_password',
      env: 'RESET_URL',
      arg: 'reset-url'
    },
    accountUnlockUrl: {
      doc: 'Unlocked account url',
      format: String,
      default: 'https://accounts.firefox.com/complete_unlock_account',
      env: 'UNLOCK_URL',
      arg: 'unlock-url'
    },
    initiatePasswordResetUrl: {
      doc: 'Password reset url',
      format: String,
      default: 'https://accounts.firefox.com/reset_password'
    },
    initiatePasswordChangeUrl: {
      doc: 'Password change url',
      format: String,
      default: 'https://accounts.firefox.com/settings/change_password'
    },
    syncUrl: {
      doc: 'url to Sync product page',
      format: String,
      default: 'https://www.mozilla.org/firefox/sync/'
    },
    androidUrl: {
      doc: 'url to Android product page',
      format: String,
      default: 'https://www.mozilla.org/firefox/android/'
    },
    iosUrl: {
      doc: 'url to IOS product page',
      format: String,
      default: 'https://www.mozilla.org/firefox/ios/'
    },
    supportUrl: {
      doc: 'url to Mozilla Support product page',
      format: String,
      default: 'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account'
    }
  }
})

var envConfig = path.join(__dirname, 'config', conf.get('env') + '.json')
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync)
conf.loadFile(files)

process.env.NODE_ENV = conf.get('env')

var options = {
  strict: true
}

conf.validate(options)

module.exports = conf
