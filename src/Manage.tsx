import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { List, Layout, Space, Typography } from "antd";
const { Text } = Typography;
import { PageHeader } from "antd";
import { Radio } from "antd";
import { Badge, Popover, Tag, Tooltip } from "antd";
import { message, Spin } from "antd";
import {
  CaretDownOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";

import axios from "./public/axios-config";
import { UserItem } from "./public/interfaces";

const UserStatus = (props: {
  status: 0 | 1 | 2 | undefined;
  onChange?: () => void | undefined;
}) => {
  const mapTag = (status: 0 | 1 | 2) => {
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
        <Space align="center">
          {mapTag(props.status)}
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
            <CaretDownOutlined />
          </Popover>
        </Space>
      ) : undefined}
    </>
  );
};

const QueueList = (props: { data: Array<UserItem> }) => {
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
  return (
    <List
      size="small"
      dataSource={props.data}
      renderItem={(item) => (
        <List.Item key={item.priority}>
          <Space align="center">
            {`${item.priority}. ${item.name}`}
            {mapTag(item.status)}
          </Space>
        </List.Item>
      )}
    />
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
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(false);

  const [queueData, setQueueData] = useState<Array<UserItem>>([]);
  const validReviewer = (reviewer: UserItem) => {
    return (
      (reviewer.status === 0 || reviewer.status === 1) &&
      userInfo?.id !== reviewer.id
    );
  };
  const nextReviewer = queueData.find(validReviewer);

  const mapRole = () => {
    switch (userInfo.role) {
      case 0:
        return "打工人";
      case 1:
        return "审核人";
      default:
        return undefined;
    }
  };

  const mapContent = () => {
    switch (userInfo.role) {
      case 0:
        return (
          <Space>
            你好，打工人，下一分配顺位是
            <Tooltip
              title={<QueueList data={queueData} />}
              color="white"
              placement="bottomRight"
            >
              {nextReviewer ? (
                <Text type="secondary">
                  <Space>
                    {nextReviewer.name}
                    <DownOutlined />
                  </Space>
                </Text>
              ) : undefined}
            </Tooltip>
          </Space>
        );
      case 1:
        return (
          <Space>
            你好，审核人，你的分配顺位为
            <Tooltip
              title={<QueueList data={queueData} />}
              color="white"
              placement="bottomRight"
            >
              <Text type="secondary">
                <Space>
                  {userInfo.status != 2 ? userInfo.priority : "-"}
                  <DownOutlined />
                </Space>
              </Text>
            </Tooltip>
            {userInfo.skipped ? <Tag color="default">跳过一篇</Tag> : undefined}
          </Space>
        );
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const cachedUser = sessionStorage.getItem("user");
      if (!userInfo.id && !!cachedUser) {
        setUserInfo(JSON.parse(cachedUser));
        return;
      }
      try {
        const response = await axios.post("/api/user/info", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setUserInfo(response.data.data.user);
          sessionStorage.setItem(
            "user",
            JSON.stringify(response.data.data.user)
          );
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
    };
    const fetchQueue = async () => {
      try {
        const response = await axios.post("/api/queue/list", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setQueueData(response.data.data.queue);
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
    };
    setUserInfoLoading(true);
    fetchUserInfo();
    fetchQueue();
    setUserInfoLoading(false);
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
            subTitle={mapRole()}
            extra={[
              userInfo.role ? (
                <UserStatus
                  status={userInfo.status}
                  onChange={() => setRefreshTime(Date.now())}
                />
              ) : undefined,
            ]}
          >
            {mapContent()}
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
