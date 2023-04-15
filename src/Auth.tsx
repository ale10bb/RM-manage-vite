import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Result } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import axios from "./public/axios-config";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [errmsg, setErrmsg] = useState<string>(
    "There are some problems with your operation."
  );

  useEffect(() => {
    const auth = async () => {
      if (sessionStorage.getItem("token") !== null) {
        navigate("/manage");
        return;
      }
      const myUrlSearchParams = new URLSearchParams(location.search);
      const code = myUrlSearchParams.get("code");
      if (!!code) {
        try {
          const response = await axios.post("/api/auth", { code: code });
          if (response.data.result) {
            setErrmsg(response.data.err);
            setLoading(false);
            navigate("/403");
          } else {
            sessionStorage.setItem("token", response.data.data.token);
            sessionStorage.setItem(
              "user",
              JSON.stringify(response.data.data.user)
            );
            navigate("/manage");
          }
        } catch (error: any) {
          setErrmsg(error.message);
          setLoading(false);
        }
        return;
      }
      const token = myUrlSearchParams.get("token");
      if (!!token) {
        try {
          const response = await axios.post(
            "/api/user/info",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.err) {
            setErrmsg(response.data.err);
            setLoading(false);
            navigate("/403");
          } else {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem(
              "user",
              JSON.stringify(response.data.data.user)
            );
            navigate("/manage");
          }
        } catch (error: any) {
          setErrmsg(error.message);
          setLoading(false);
        }
        return;
      }
      try {
        const response = await axios.post("/api/redirect");
        if (response.data.result) {
          setErrmsg(response.data.err);
          setLoading(false);
        } else {
          window.location.replace(response.data.data.url);
        }
      } catch (error: any) {
        setErrmsg(error.message);
        setLoading(false);
      }
    };
    auth();
  }, []);

  return (
    <>
      {loading ? (
        <Result
          icon={<LoadingOutlined />}
          title="登录中"
          subTitle="正在请求OAuth，请稍等"
        />
      ) : (
        <Result status="error" title="登录失败" subTitle={errmsg} />
      )}
    </>
  );
};

const Unauthorized = () => {
  return <Result status="403" title="403" subTitle="你无权访问该页面" />;
};

export { Auth, Unauthorized };
