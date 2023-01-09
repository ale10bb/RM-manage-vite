import { useState, useEffect } from "react";
import { Breadcrumb, Row, Col, Space } from "antd";
import { message } from "antd";
import { Card, Skeleton } from "antd";
import { Form, Input, Button, Collapse } from "antd";

import axios from "axios";

import { ProjectTable } from "./public/Project";
import { ProjectItem, UserItem } from "./public/interfaces"

const HistoryMain = () => {
  // 表单及结果表格
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState<string | string[]>("1");
  const [tableData, setTableData] = useState<Array<ProjectItem>>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  // 用户列表（用于选择邮件发送对象），history情况下获取所有有效用户
  const [userData, setUserData] = useState<Array<UserItem>>([]);

  // 启动时加载user的数据
  useEffect(() => {
    const fetchUser = async () => {
      axios.post(
        "/api2/user/list",
        { isReviewer: false }
      ).then((response) => {
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        }
        else {
          setUserData(response.data.data.user);
        }
      }).catch(function (error) {
        message.error(`获取失败(${error.message})`);
      });
    };
    fetchUser();
  }, []);

  const onSubmit = async () => {
    setActiveKey([]);
    setTableLoading(true);

    axios.post(
      "/api2/history/search",
      form.getFieldsValue()
    ).then((response) => {
      if (response.data.result) {
        message.error(`获取失败(${response.data.err})`);
      }
      else {
        setTableData(response.data.data.history);
      }
    }).catch(function (error) {
      message.error(`获取失败(${error.message})`);
    });
    setTableLoading(false);
  };

  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(key);
  }

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Manage</Breadcrumb.Item>
        <Breadcrumb.Item>历史项目</Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Collapse accordion activeKey={activeKey} onChange={handleCollapseChange}>
            <Collapse.Panel header="搜索条件" key="1">
              <Form form={form} onFinish={onSubmit}>
                <Form.Item name="code" label="项目编号">
                  <Input placeholder="SHTEC2099PRO9999" />
                </Form.Item>
                <Form.Item name="name" label="项目名称">
                  <Input placeholder="网站系统" />
                </Form.Item>
                <Form.Item name="company" label="委托单位">
                  <Input placeholder="XXX中心" />
                </Form.Item>
                <Form.Item name="author" label="撰写人">
                  <Input placeholder="张三三/zhangss" />
                </Form.Item>
                <Form.Item>
                  <Space direction="horizontal" size="middle">
                    <Button htmlType="reset">重置</Button>
                    <Button type="primary" htmlType="submit">搜索</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Collapse.Panel>
          </Collapse>
        </Col>
        <Col span={24}>
          <Card>
            <Skeleton active loading={tableLoading}>
              <ProjectTable
                type="history"
                data={tableData}
                user={userData}
                onChange={() => { }}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HistoryMain;
