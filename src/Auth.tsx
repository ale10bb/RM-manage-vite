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
      const token = sessionStorage.getItem("token");
      if (token) {
        navigate("/manage");
        return;
      }
      const code = new URLSearchParams(location.search).get("code");
      if (code) {
        try {
          const response = await axios.post("/api/auth", { code: code });
          if (response.data.result) {
            setErrmsg(response.data.err);
            setLoading(false);
            navigate("/403");
          } else {
            sessionStorage.setItem("token", response.data.data.token);
            navigate("/manage");
          }
        } catch (error: any) {
          setErrmsg(error.message);
          setLoading(false);
        }
      } else {
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
        <Result status="error" title="Auth Failed" subTitle={errmsg} />
      )}
    </>
  );
};

const Unauthorized = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
    />
  );
};

export { Auth, Unauthorized };
