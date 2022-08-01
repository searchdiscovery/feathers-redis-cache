/* eslint-disable no-console */
import redis from 'redis';
import chalk from 'chalk';

const DISABLE_REDIS_CACHE = process.env.DISABLE_REDIS_CACHE === 'true' || process.env.DISABLE_REDIS_CACHE === '1'
const defaultPrefix = 'frc_';

export default (options: any = {}) => {
  const errorLogger = options.errorLogger || console.error;
  const retryInterval = options.retryInterval || 5000;

  if (DISABLE_REDIS_CACHE) {
    return () => {};
  }

  return function client() {
    const app = this;
    const config = app.get('redis') || {};

    try {
      const redisOptions = {
        prefix: defaultPrefix,
        ...config,
        retry_strategy: () => {
          app.set('redisClient', undefined);

          console.log(`${chalk.yellow('[redis]')} not connected`);

          return retryInterval;
        }
      };
      const client = redis.createClient(redisOptions);

      app.set('redisClient', client);

      console.log("THis is a thing here yay");

      client.on('ready', () => {
        app.set('redisClient', client);

        console.log(`${chalk.green('[redis]')} connected`);
      });
    } catch (err) {
      errorLogger(err);
      app.set('redisClient', undefined);
    }

    return this;
  };
}
