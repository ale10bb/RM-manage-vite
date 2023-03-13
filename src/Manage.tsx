import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Layout, Space } from "antd";
import { PageHeader } from "antd";
import { Radio } from "antd";
import { Badge, Popover, Tag } from "antd";
import { message, Spin } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";

import axios from "./public/axios-config";
import { UserItem } from "./public/interfaces";

const ManageStatus = (props: {
  status: 0 | 1 | 2 | undefined;
  onChange?: () => void | undefined;
}) => {
  const handleEditStatus = async (value: 0 | 1 | 2) => {
    try {
      const response = await axios.post("/api/user/status", {
        status: value,
      });
      if (response.data.result) {
        message.error(`设置失败(${response.data.err})`);
      } else {
        message.success("设置成功");
        props.onChange ? props.onChange() : undefined;
      }
    } catch (error: any) {
      message.error(`设置失败(${error.message})`);
    }
  };

  return (
    <>
      {props.status !== undefined ? (
        <Popover
          placement="bottomRight"
          content={
            <Radio.Group
              defaultValue={props.status}
              onChange={(e: RadioChangeEvent) =>
                handleEditStatus(e.target.value)
              }
            >
              <Space direction="vertical">
                <Radio value={0}>
                  <Badge status="success" text="空闲" />
                </Radio>
                <Radio value={1}>
                  <Badge status="warning" text="不审加急" />
                </Radio>
                <Radio value={2}>
                  <Badge status="error" text="不审报告" />
                </Radio>
              </Space>
            </Radio.Group>
          }
        >
          <MoreOutlined />
        </Popover>
      ) : undefined}
    </>
  );
};

const Manage = () => {
  const [refreshTime, setRefreshTime] = useState<number>(Date.now());
  const [userInfo, setUserInfo] = useState<UserItem>({
    id: undefined,
    name: "undefined",
    role: undefined,
    status: undefined,
    pages_diff: undefined,
    current: undefined,
    skipped: undefined,
    priority: undefined,
  });
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);

  const mapTag = (status: 0 | 1 | 2 | undefined) => {
    switch (status) {
      case 0:
        return <Tag color="green">空闲</Tag>;
      case 1:
        return <Tag color="warning">忙碌</Tag>;
      case 2:
        return <Tag color="error">不审</Tag>;
      default:
        return undefined;
    }
  };

  const mapRole = (role: 0 | 1 | undefined) => {
    switch (role) {
      case 0:
        return "打工人";
      case 1:
        return "审核人";
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.post("/api/user/info", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setUserInfo(response.data.data.user);
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
      setUserInfoLoading(false);
    };
    fetchUserInfo();
  }, [refreshTime]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          padding: "0 0",
          position: "sticky",
          top: 0,
          zIndex: 1,
          height: "100%",
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <Spin spinning={userInfoLoading}>
          <PageHeader
            ghost={false}
            avatar={{ icon: <UserOutlined /> }}
            title={userInfo.name}
            subTitle={mapRole(userInfo.role)}
            tags={mapTag(userInfo.status)}
            extra={[
              userInfo.role ? (
                <ManageStatus
                  status={userInfo.status}
                  onChange={() => setRefreshTime(Date.now())}
                />
              ) : undefined,
            ]}
          >
            {userInfo.role === 1
              ? `你好，审核人，你的分配顺位为 ${userInfo.priority} `
              : `你好，打工人，该起床写报告了`}
            {userInfo.role === 1 && userInfo.skipped ? (
              <Tag color="default">跳过一篇</Tag>
            ) : undefined}
          </PageHeader>
        </Spin>
      </Layout.Header>
      <Layout.Content style={{ margin: "0 20px", marginTop: 20 }}>
        <Outlet></Outlet>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </Layout>
  );
};

export default Manage;
