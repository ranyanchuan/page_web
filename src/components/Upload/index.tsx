import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect } from "dva";

import "./index.less";

import { Upload } from 'antd';
import { beforeUpload, getStorageToken, uploadUrl } from "@/utils";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';


const App = (props: any) => {

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(props.src);

  const { onRef } = props;

  useEffect(() => {
    setImageUrl(props.src)
  }, [props.src]);


  // 定义父调用子的钩子函数
  useImperativeHandle(onRef, () => ({
    editModal: (record: any) => {
     
    },

    getImgUrl: () => {
      return imageUrl
    },
    setImgUrl: (url:any) => {
      return setImageUrl(url)
    }
  }));






  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      setImageUrl(info?.file?.response?.message);
      const url=info?.file?.response?.message
      props?.setImg?.(url)
      // console.log(info.file.response);
    }
  };



  return (
    <>
      <Upload
        {...props}
        name="file"
        // data={
        //   { biz: "temp" }
        // }
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={handleChange}

        headers={
          { "X-Access-Token": `${getStorageToken()}` }
        }
      >
        <>
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%', maxHeight: '102px', maxWidth: '102px' }} /> : uploadButton}
        </>
      </Upload>
    </>
  );
};

export default connect((state: any) => ({
  dashboardModel: state.dashboardModel,
}))(App);






