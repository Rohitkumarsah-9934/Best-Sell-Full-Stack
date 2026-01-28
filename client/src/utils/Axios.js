import axios from "axios";
import summaryApi, {baseUrl} from "../common/SummaryApi"


const Axios = axios.create({
    baseURL:baseUrl,
    withCredentials:true,
     
})
Axios.interceptors.request.use(
   async (config) => {
         // You can modify the request config here if needed
         const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;

},
    (error) => {
        return Promise.reject(error);
    }

)

//refresh token
Axios.interceptors.request.use(
    (response)=>{
        return response;

    },
    async (error)=>{
        const originalRequest = error.config;

        if ( error.response.status === 401 && !originalRequest.retry) {
            originalRequest.retry = true;

            //request for new access token
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return Axios(originalRequest);
                    }

                }

        }
        return Promise.reject(error);
    }
);
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await Axios({
            ...summaryApi.refresh_token,
            headers:{
                Authorization: `Bearer ${refreshToken}`
            }
        })
        const accessToken = response.data.data.accessToken;
        localStorage.setItem("accessToken",accessToken)
        return accessToken;
       
        
    } catch (error) {
        console.log("Error refreshing access token", error)
        
    }
}


export default Axios