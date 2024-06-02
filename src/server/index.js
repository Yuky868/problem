import axios from 'axios'

export const getToken = () => axios.post(`/backend/yc-oss/token?bucket=yc-course&expires=1800`, undefined, { responseType: 'json' })

