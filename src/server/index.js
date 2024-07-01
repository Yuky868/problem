import axios from 'axios'

export const getToken = () => axios.post(`https://7to12-test.yangcong345.com/backend/yc-oss/token?bucket=yc-course&expires=1800`, undefined, { responseType: 'json' })

