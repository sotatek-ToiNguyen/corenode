/**
 * Redis data structure:
 * available: [{userId: string, exchange_name: string, key: string, secret: string, last_time_executed: Date, is_leader: boolean}]
 */

const redis = require('redis');
const url = require('url');
const { promisify } = require('util');

const REDIS_URL = process.env.REDIS_URL

const redisClient = redis.createClient({
    url: REDIS_URL,
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const getKeysAsync = promisify(redisClient.keys).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAllAsync = promisify(redisClient.hgetall).bind(redisClient);
const hsetAsync = promisify(redisClient.hset).bind(redisClient);
const hgetAsync = promisify(redisClient.hget).bind(redisClient);
const expireatAsync = promisify(redisClient.expireat).bind(redisClient);

const getRedisOptions = (redisUrl) => {
    try {
        const redis_uri = new url.URL(redisUrl);
        const result = {
            port: Number(redis_uri.port),
            host: redis_uri.hostname,
            password: redis_uri.password,
            db: 0,
        };

        return result;
    } catch (error) {
        console.error(new Date(), `error getRedisOptions`, error);
        return {};
    }
};

const initClient = () => {
    return redis.createClient({
        url: REDIS_URL,
        retry_strategy: (options) => {
            console.log(new Date(), options);
            return TEN_SECONDS;
        },
    });
};

module.exports = {
    getAsync,
    setAsync,
    hsetAsync,
    hgetAsync,
    getAllAsync,
    getKeysAsync,
    redisClient,
    initClient,
    getRedisOptions,
    expireatAsync,
};
