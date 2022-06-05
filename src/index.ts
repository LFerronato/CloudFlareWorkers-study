import { Redis } from '@upstash/redis/cloudflare'
import { listen, Router } from 'worktop'

const routes = new Router()

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN
})

routes.add('GET', '/', async (req, resp) => {
  const access_count = await redis.get('access_count')

  return resp.send(200, {
    access_count,
    query_MyNameIs: req.query.get('MyNameIs'),
    others_routes: {
      get_count: '/',
      increase_count: '/count',
      reset_count: '/reset',
    },
    cf: req.cf, // IncomingCloudflareProperties
  })
})

const ROUTES_str = `

  * get_count:      '/'
  * increase_count: '/count'
  * reset_count:    '/reset'
`

routes.add('GET', '/count', async (req, resp) => {
  const access_count = await redis.incr('access_count')

  return resp.send(200, 'new count: ' + access_count + ROUTES_str)
})

routes.add('GET', '/reset', async (req, resp) => {
  const access_count = await redis.del('access_count')

  return resp.send(200, 'new count: ' + access_count + ROUTES_str)
})

listen(routes.run)
