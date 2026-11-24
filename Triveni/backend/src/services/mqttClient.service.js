const mqtt = require('mqtt');
const env = require('../config/env');
const logger = require('../utils/logger');
const mqttProductionService = require('./mqttProduction.service');

let client = null;

/**
 * Opens the single persistent MQTT connection this backend uses to receive live Produced Qty
 * readings from machines, and subscribes to the configured production topic. A no-op (feature
 * disabled) when MQTT_BROKER_URL isn't set - mirrors the coilLookup "optional external
 * integration" pattern, so local dev without a broker doesn't need to fake one.
 *
 * Reconnection is handled entirely by the `mqtt` library itself (reconnectPeriod below) - it keeps
 * retrying indefinitely and re-fires the 'connect' handler (which re-subscribes) on every
 * reconnect, so a broker restart or network blip recovers without any code here needing to notice.
 */
function start() {
  if (!env.mqtt.brokerUrl) {
    logger.info('MQTT_BROKER_URL not configured - MQTT production intake is disabled');
    return null;
  }
  if (client) return client;

  // mqtt.connect() validates its options synchronously and throws (rather than emitting 'error')
  // on a malformed URL - this must never take the whole backend down over a config mistake, so
  // it's caught here and MQTT intake is simply left disabled, same as the "not configured" case.
  try {
    client = mqtt.connect(env.mqtt.brokerUrl, {
      clientId: env.mqtt.clientId,
      username: env.mqtt.username,
      password: env.mqtt.password,
      reconnectPeriod: env.mqtt.reconnectPeriodMs,
      clean: true,
    });
  } catch (err) {
    logger.error('MQTT connect() rejected the configured MQTT_BROKER_URL - MQTT production intake is disabled', {
      brokerUrl: env.mqtt.brokerUrl,
      error: err.message,
    });
    client = null;
    return null;
  }

  client.on('connect', () => {
    logger.info('MQTT broker connected', { brokerUrl: env.mqtt.brokerUrl, clientId: env.mqtt.clientId });
    client.subscribe(env.mqtt.productionTopic, { qos: env.mqtt.qos }, (err) => {
      if (err) {
        logger.error('MQTT subscribe failed', { topic: env.mqtt.productionTopic, error: err.message });
      } else {
        logger.info('MQTT subscribed to production topic', { topic: env.mqtt.productionTopic, qos: env.mqtt.qos });
      }
    });
  });

  client.on('reconnect', () => logger.warn('MQTT reconnecting to broker'));
  client.on('close', () => logger.warn('MQTT connection closed'));
  client.on('offline', () => logger.warn('MQTT client is offline'));
  client.on('error', (err) => logger.error('MQTT client error', { error: err.message }));

  client.on('message', (topic, payload) => {
    // Handed off without awaiting - each message is processed independently so a slow DB write
    // never blocks the listener from receiving the next one. processMessage never throws (every
    // failure path inside it is caught and logged), but this .catch is a last-resort backstop so
    // a truly unexpected exception still can't kill message consumption.
    mqttProductionService.processMessage(payload.toString()).catch((err) => {
      logger.error('Unhandled error while processing MQTT production message', {
        topic,
        error: err.message,
        stack: err.stack,
      });
    });
  });

  return client;
}

function stop() {
  if (client) {
    client.end(true);
    client = null;
  }
}

module.exports = { start, stop };
