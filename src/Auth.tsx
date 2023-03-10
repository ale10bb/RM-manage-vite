import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Result, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import axios from "./public/axios-config";

function Auth() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = async () => {
      const code = new URLSearchParams(location.search).get("code");
      if (code) {
        try {
          const response = await axios.post("/api/auth", { code: code });
          if (response.data.result) {
            message.error(`认证失败(${response.data.err})`);
            setLoading(false);
          } else {
            sessionStorage.setItem("token", response.data.data.token);
            window.location.replace("/");
          }
        } catch (error: any) {
          message.error(`认证失败(${error.message})`);
          setLoading(false);
        }
      } else {
        try {
          const response = await axios.post("/api/redirect");
          if (response.data.result) {
            message.error(`认证失败(${response.data.err})`);
            setLoading(false);
          } else {
            window.location.replace(response.data.data.url);
          }
        } catch (error: any) {
          message.error(`认证失败(${error.message})`);
          setLoading(false);
        }
      }
    };
    auth();
  }, []);

  return (
    <>
      {loading ? (
        <Result
          icon={<LoadingOutlined />}
          title="Redirecting"
          subTitle="Redirecting to OAuth."
        />
      ) : (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
        />
      )}
    </>
  );
}

export default Auth;
