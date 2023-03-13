import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button, Typography } from "antd";
import { Row, Col, Space } from "antd";
import { Form, Input, Switch } from "antd";
import { Card } from "antd";
import { message, Spin } from "antd";
import { LoadingOutlined, MailOutlined } from "@ant-design/icons";

import axios from "./public/axios-config";
import { ProjectItem } from "./public/interfaces";
import { ProjectList } from "./public/Project";

const Dashboard = () => {
  // Card: 邮件处理
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailForm] = Form.useForm();
  const [mailAdvanced, setMailAdvanced] = useState<boolean>(false);
  // Card: 我的任务
  const [refreshTime, setRefreshTime] = useState<number>(Date.now());
  const [currentData, setCurrentData] = useState<{
    project: Array<ProjectItem>;
    total: number;
  }>({ project: [], total: 0 });
  const [currentLoading, setCurrentLoading] = useState<boolean>(true);
  const [currentTableConfig, setCurrentTableConfig] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await axios.post("/api/current/list", {});
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setCurrentData({
            project: response.data.data.current,
            total: response.data.data.total,
          });
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      }
      setCurrentLoading(false);
    };
    fetchCurrent();
  }, [refreshTime, JSON.stringify(currentTableConfig)]);

  const handleMail = async (values: { submit: string; finish: string }) => {
    setMailLoading(true);
    try {
      const response = await axios.post("/api/mail", values);
      if (response.data.result) {
        message.error(`执行失败(${response.data.err})`);
      } else {
        message.success("已加入执行队列");
      }
    } catch (error: any) {
      message.error(`执行失败(${error.message})`);
    }
    setMailLoading(false);
  };

  const handleMailAdvancedSwitch = (checked: boolean) => {
    mailForm.resetFields();
    setMailAdvanced(checked);
  };

  const handlePageChange = (
    current: number | undefined,
    pageSize: number | undefined
  ) => {
    setCurrentTableConfig(
      Object.assign(currentTableConfig, {
        current: current,
        pageSize: pageSize,
      })
    );
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="邮件处理">
          <Form
            form={mailForm}
            layout={mailAdvanced ? "vertical" : "inline"}
            onFinish={handleMail}
          >
            <Form.Item>
              <Space direction="horizontal">
                <Button type="primary" htmlType="submit">
                  {mailLoading ? <LoadingOutlined /> : <MailOutlined />}
                  执行
                </Button>
                <Switch
                  onChange={(checked) => handleMailAdvancedSwitch(checked)}
                />
                <Typography.Text>自定义关键词</Typography.Text>
              </Space>
            </Form.Item>
            <Form.Item
              hidden={!mailAdvanced}
              name="submit"
              label="提交审核"
              initialValue=""
              rules={[
                {
                  type: "string",
                  min: 4,
                  message: "自定义关键词至少需要4个字符",
                },
              ]}
            >
              <Input placeholder="[提交审核]" />
            </Form.Item>
            <Form.Item
              hidden={!mailAdvanced}
              name="finish"
              label="完成审核"
              initialValue=""
              rules={[
                {
                  type: "string",
                  min: 4,
                  message: "自定义关键词至少需要4个字符",
                },
              ]}
            >
              <Input placeholder="[完成审核]" />
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={24}>
        <Spin spinning={currentLoading}>
          <Card
            title="我的任务"
            extra={<Link to={"/manage/history"}>历史项目</Link>}
          >
            <ProjectList
              type="current"
              data={currentData}
              pagination={{
                current: currentTableConfig.current,
                pageSize: currentTableConfig.pageSize,
              }}
              onPageChange={handlePageChange}
              onDataChange={() => setRefreshTime(Date.now())}
            />
          </Card>
        </Spin>
      </Col>
    </Row>
  );
};

export default Dashboard;
