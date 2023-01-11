import { useState, useEffect } from "react";
import { Breadcrumb } from "antd";
import { message } from "antd";
import { Card, Spin } from "antd";

import axios from "axios";

import { ProjectTable } from "./public/Project";
import { ProjectItem, UserItem } from "./public/interfaces";

const CurrentMain = () => {
  // 结果表格
  const [refreshTime, setRefreshTime] = useState<number>(Date.now())
  const [tableData, setTableData] = useState<Array<ProjectItem>>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  // 用户列表（用于选择邮件发送对象），current情况下获取审核人
  const [userData, setUserData] = useState<Array<UserItem>>([]);

  useEffect(() => {
    const fetchUser = async () => {
      axios.post(
        "/api2/user/list",
        { isReviewer: true }
      ).then((response) => {
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setUserData(response.data.data.user);
        }
      }).catch(function (error) {
        message.error(`获取失败(${error.message})`);
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCurrent = async () => {
      setTableLoading(true);
      try {
        const response = await axios.post("/api2/current/list", {})
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setTableData(response.data.data.current);
        }
      } catch (error: any) {
        message.error(`获取失败(${error.message})`);
      };
      setTableLoading(false);
    };
    fetchCurrent();
  }, [refreshTime]);

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Manage</Breadcrumb.Item>
        <Breadcrumb.Item>当前项目</Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <Spin spinning={tableLoading} delay={500}>
          <ProjectTable
            type="current"
            data={tableData}
            user={userData}
            onChange={() => setRefreshTime(Date.now())}
          />
        </Spin>
      </Card>
    </>
  );
};

export default CurrentMain;
