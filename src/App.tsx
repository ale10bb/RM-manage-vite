import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu, Row, Col, Space } from "antd";
import { Typography } from "antd";
import {
  HomeOutlined,
  HistoryOutlined,
  HourglassOutlined,
} from "@ant-design/icons";

import axios from "axios";

import HomeMain from "./Home";
import HistoryMain from "./History";
import CurrentMain from "./Current";
import "./App.css";

function App() {
  const location = useLocation();
  axios.defaults.baseURL = import.meta.env.VITE_API_DOMAIN;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          padding: "0 0",
          position: "fixed",
          zIndex: 1,
          width: "100%",
          background: "#fff",
        }}
      >
        <Row>
          <Col xs={0} sm={2} md={2} lg={2} xl={1}>
            <div className="logo">
              <img src={"/favicon.png"} alt="" />
            </div>
          </Col>
          <Col xs={24} sm={22} md={22} lg={22} xl={23}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              style={{ height: "100%" }}
            >
              <Menu.Item key="/" icon={<HomeOutlined />}>
                <Link to="/">首页</Link>
              </Menu.Item>
              <Menu.Item
                key="/current"
                icon={<HourglassOutlined />}
              >
                <Link to="/current">当前项目</Link>
              </Menu.Item>
              <Menu.Item
                key="/history"
                icon={<HistoryOutlined />}
              >
                <Link to="/history">存档项目</Link>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
      </Layout.Header>
      <Layout>
        <Layout.Content style={{ margin: "0 20px", marginTop: 64 }}>
          <Routes>
            <Route path="/" element={<HomeMain />} />
            <Route path="/current" element={<CurrentMain />} />
            <Route path="/history" element={<HistoryMain />} />
          </Routes>
        </Layout.Content>
        <Layout.Footer style={{ textAlign: "center" }}>
          <Space size="large">
            <Typography.Text>RM-Manage</Typography.Text>
            <a href="https://beian.miit.gov.cn/">
              沪ICP备2020030506号
            </a>
          </Space>
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}

export default App;
