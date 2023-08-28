import axios from 'axios'
import axiosRetry from 'axios-retry'

const axiosInstance = axios.create()

axiosRetry(axiosInstance, {
  retries: 3,
  retryCondition(error) {
    const url = error.response?.config.url ?? ''
    console.log('error url: ', url)

    return url.includes('api.openai.com')
  },
  retryDelay: (retryCount, error) => {
    console.log('Axios retry', {
      retryCount,
      url: error.response?.config.url,
      error: error.message,
    })

    return retryCount ** 2 * 400
  },
})

export default axiosInstance
