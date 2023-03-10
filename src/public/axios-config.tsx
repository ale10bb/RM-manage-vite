import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_DOMAIN;
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log(error)
    if (error.response.status === 401 || error.response.status === 422) {
      sessionStorage.removeItem("token");
      window.location.replace("/auth");
    }
    return Promise.reject(error);
  }
);

export default axios;
