import getDBStatus from '../database/db.js'

export const checkHealth = async (req, res) => {
  try {
    const dbStatus = getDBStatus()

    const healthStatus = {
      status: 'OK',
      timeStamp: new Date().toString(),
      services: {
        database: {
          status: dbStatus.isConnected ? 'healthy' : 'unhealthy',
          details: {
            ...dbStatus,
            readyState: getReadyState(dbStatus.readyState)
          }
        },
        server: {
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
      }
    }

    const httpStatus =
      healthStatus.services.database.status === 'healthy' ? 200 : 503

    res.status(httpStatus).json(healthStatus)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      status: 'ERROR',
      timeStamp: new Date().toString()
    })
  }
}

function getReadyState(state) {
  switch (state) {
    case 0:
      return 'disconnected'
    case 1:
      return 'connected'
    case 2:
      return 'connecting'
    case 3:
      return 'disconnecting'
    default:
      return 'unknown'
  }
}
