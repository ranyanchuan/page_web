import { connect } from "umi";

import { CheckCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

import webIcon from "@/assets/web.gif"
import { deepCopy, getLastNode } from "@/utils";

import "./WorkflowCard.less"
import { useState } from "react";
import { Tooltip } from "antd";


const WorkflowCard = (props: any) => {

    const { isEndNode, loading, row } = props
    const { toolArr, tool_type, tool_name, tool_call_recipient } = row

    const [showCard, setShowCard] = useState(false);

    const onClickOpen = () => {
        setShowCard(!showCard)
    }


    //  工作流执行 loading
    const getWorkflowLoading = (param: any) => {
        return <div className="tool_title_wrap">
            <div>
                <img className="web_icon" src={webIcon} alt="" />
                <span>正在调用</span>
            </div>
            <Tooltip placement="top" title={handleToolName(getLastNode(param)["title"])}>
                <div className="tool_name_container">
                    <span> {handleToolName(getLastNode(param)["title"])} </span>
                </div>
            </Tooltip>
            <div>
                <span>工具</span>
            </div>

        </div>
    }

    // 工具名称处理
    const handleToolName = (param: any) => {
        let res = param?.split?.("__")?.[0] || param;
        // res = res
        // if(res.length > 8) {
        //     res = `${res.substring(0,8)}...`;
        // }

        return res;
    };
    
    // 工作流执行显示
    const getWorkflowTitle = (param: any) => {
        return <div className="tool_title_wrap">
            <div>
                <span className="success_icon">
                    <CheckCircleOutlined style={{ color: "#009A29" }} />
                </span>
                <span>执行 </span>
            </div>
            <Tooltip placement="top" title={handleToolName(tool_name)}>
                <div className="tool_name_container">
                    <span> {`${handleToolName(tool_name)}`}</span>
                </div>
            </Tooltip>
            <div>
                <span>工具</span>
            </div>
        </div>
    }


    // 打开的网页    
    const getWebTools = () => {
        let res = []
        try {
            res = tool_call_recipient || []
        } catch (err: any) {
            console.log("err", err)
        }
        return res
    }

    return (
        <>
            <div className="workflow_card_container">
                <div className="search_title">
                    {(loading && isEndNode) ? getWorkflowLoading(toolArr) : getWorkflowTitle(toolArr)}
                    <div className="open_icon" onClick={onClickOpen} >
                        {!showCard && <DownOutlined />}
                        {showCard && <UpOutlined />}
                    </div>
                </div>


                {(showCard && tool_type !== "websearch") &&
                    <div className="search_container">
                        <div className="item_title">工具节点</div>
                        <div className="web_search_wrap">
                            {toolArr?.map((wItem: any, wIndex: any) => {
                                const { tool_args } = wItem
                                return <div className="process" key={wIndex}>
                                    <div className="process_title_wrap">
                                        <div className="process_title">{`${wIndex + 1}. ${wItem.title}`}</div>
                                        <div className="process_sub">
                                            <div className="process_url">{wItem.desc}</div>
                                            {/* <div className="process_url">{JSON.stringify(tool_args)}</div> */}
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                        {/* <div className="item_title">调用工具并总结</div> */}
                    </div>
                }


                {(showCard && tool_type == "websearch") &&
                    <div className="search_container">
                        {/* <div className="item_title">打开网页</div> */}
                        <div className="web_search_wrap">
                            {getWebTools()?.map((wItem: any, wIndex: any) => {
                                const { title, url, text } = wItem
                                return <div className="process" key={wIndex}>
                                    <div className="process_title_wrap" onClick={() => window.open(url, "_blank")}>
                                        <div className="process_title">{`${wIndex + 1}. ${wItem.title}`}</div>
                                        <div className="process_sub">
                                            {/* <div className="process_url">{wItem.desc}</div> */}
                                            <div className="process_url">{url}</div>
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                        {/* <div className="item_title">调用工具并总结</div> */}
                    </div>
                }

            </div>
        </>
    );
};


export default connect((state: any) => ({
    commonModel: state.commonModel,
}))(WorkflowCard);


