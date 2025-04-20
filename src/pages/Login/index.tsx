import { connect, useDispatch, history } from "umi";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { ZYIcon } from "@/components";

import "./index.less";
import { layoutData } from "@/utils";

const App = (props: any) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const getUserInfo = async (values?: any) => {
    let { code, data } = await dispatch({
      type: "LoginModel/getData",
      apiUrl: "userInfoUrl",
      payload: { ...values },
    });

    // console.log("data_____",data)
    if (code == 200) {
      localStorage.setItem("userInfo", JSON.stringify(data));
    }

    const {aId}=layoutData[0]
    history.push(`/?id=${aId}`);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    let { code, data, msg } = await dispatch({
      type: "LoginModel/getData",
      apiUrl: "loginUrl",
      payload: { ...values },
    });

    if (code === 200) {
      localStorage.setItem("accessToken", data.accessToken);
      await getUserInfo(); // 获取用户信息
      message.success("登录成功");
    } else {
      message.error(msg || "登录失败, 请联系管理员");
    }
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login_container">
      <div className="login_body">
        <div className="login_logo">
        <img src={require("@/assets/logo2.png")}alt=""/>
          {/* <ZYIcon
            type="logo"
            size={32}
            fill="url(#gradient1)"
            defs={
              <defs>
                <linearGradient
                  id="gradient1"
                  x1="50%"
                  y1="0%"
                  x2="50%"
                  y2="100%"
                >
                  <stop offset="0%" style={{ stopColor: "#28DD7C" }} />
                  <stop offset="100%" style={{ stopColor: "#4759C5" }} />
                </linearGradient>
              </defs>
            }
          /> */}
          <div className="login_title">数智预报员助手</div>
        </div>
        <Form
          className={"login_form"}
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label=""
            name="account"
            rules={[
              {
                required: true,
                message: "请输入用户名",
              },
            ]}
          >
            <Input
              size="large"
              className="login_form_item"
              placeholder="请输入用户名"
            />
          </Form.Item>
          <Form.Item
            label=""
            name="password"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
            ]}
          >
            <Input
              size="large"
              className="login_form_item"
              type="password"
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              className="login_form_button"
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              立即登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  LoginModel: state.LoginModel,
}))(App);
