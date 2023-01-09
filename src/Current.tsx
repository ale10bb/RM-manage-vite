import { useState, useEffect } from "react";
import { Breadcrumb } from "antd";
import { message } from "antd";
import { Card, Skeleton } from "antd";

import axios from "axios";

import { ProjectTable } from "./public/Project";
import { ProjectItem, UserItem } from "./public/interfaces";

const CurrentMain = () => {
  // 结果表格
  const [tableData, setTableData] = useState<Array<ProjectItem>>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  // 用户列表（用于选择邮件发送对象），current情况下获取审核人
  const [userData, setUserData] = useState<Array<UserItem>>([]);

  useEffect(() => {
    fetchCurrent();
    const fetchUser = async () => {
      axios
        .post("/api2/user/list", { isReviewer: true })
        .then((response) => {
          if (response.data.result) {
            message.error(`获取失败(${response.data.err})`);
          } else {
            setUserData(response.data.data.user);
          }
        })
        .catch(function (error) {
          message.error(`获取失败(${error.message})`);
        });
    };
    fetchUser();
  }, []);

  const fetchCurrent = () => {
    setTableLoading(true);
    axios
      .post("/api2/current/list", {})
      .then((response) => {
        if (response.data.result) {
          message.error(`获取失败(${response.data.err})`);
        } else {
          setTableData(response.data.data.current);
        }
      })
      .catch(function (error) {
        message.error(`获取失败(${error.message})`);
      });
    setTableLoading(false);
  };

  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Manage</Breadcrumb.Item>
        <Breadcrumb.Item>当前项目</Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <Skeleton active loading={tableLoading}>
          <ProjectTable
            type="current"
            data={tableData}
            user={userData}
            onChange={fetchCurrent}
          />
        </Skeleton>
      </Card>
    </>
  );
};

export default CurrentMain;
