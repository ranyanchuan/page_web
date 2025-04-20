import { connect } from "umi";
import { Col, Progress, Row, Upload, message } from "antd";
import { CloseCircleOutlined } from '@ant-design/icons';

import "./UploadChatFile.less";
const defaultUrl = require("@/assets/upFile.png")

const UploadChatFile = (props: any) => {


  const onClickClose = (param: any) => {
    const newRes = props?.fileArr?.filter((item:any) => item.id !== param.id)
    props?.updFile?.(newRes)
  }



  return (
    <>
      <div className="chat_upload_file_container">
        <Row gutter={16}>
          {props?.fileArr?.map((item: any, index: any) => {
            return <Col className="gutter-row" span={12} key={index}>
              <div className="file_item">
                <div>
                  {item.status == "done" && <img src={item?.type?.includes("image") ? item.url : defaultUrl} alt="" />}
                  {item.status == "uploading" && <Progress type="circle" percent={item.percent} width={30} />}
                </div>
                <div className="file_info">

                  <div className="title">
                    {item.title}
                  </div>
                  <span className="close_icon" onClick={() => onClickClose(item)}>
                    <CloseCircleOutlined /></span>
                  <div className="subtitle">{item.category} {item.size}</div>
                </div>
              </div>
            </Col>
          })}

        </Row>

      </div>

    </>
  );


};



export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(UploadChatFile);
