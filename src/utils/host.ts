
//  历史原因，该写法
// https://flowtest.aminer.cn
const basePath=()=>{
    return REACT_APP_ENV!=="qxj"?"https://flow.aminer.cn":"http://10.20.90.24:11205"
    // return REACT_APP_ENV!=="qxj"?"https://flow.aminer.cn":"http://10.20.90.24:11205"
}

//气象局特有
export const qxjPath=()=>{
    return  REACT_APP_ENV!=="qxj"?"http://172.16.0.53:21233":"http://10.20.90.24:11205/qxj"
}

// REACT_APP_ENV
export const baseUrl =basePath() //

export const devHost = `${baseUrl}/kb_api_test`; //
export const devHost2 = `${baseUrl}/api`; //

