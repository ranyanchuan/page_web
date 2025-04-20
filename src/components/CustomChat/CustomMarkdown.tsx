import { connect } from "umi";
import { Popover, Image } from "antd";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm"; // 表格
import rehypeRaw from "rehype-raw"; // 添加这一行，引入rehype-raw插件
import { copyText, handlerHtmlText, hanlderMarkdownImgText, latexReplace } from "@/utils";
import { CopyOutlined } from '@ant-design/icons';


import "katex/dist/katex.min.css";
import "./CustomMarkdown.less";
import CodeLight from "../CodeLight";

const CustomMarkdown = (props: any) => {
  const { row } = props; // 显示来源
  const { citations, citationDoc } = row;
  const text = hanlderMarkdownImgText(row.text) //markdown 的图片特殊处理

  //  li标签和P标签特殊处理
  const handlerTagImg = (newChild: any) => {
    const tagArr = [] // 其他标签处理
    const imgArr = []  // 图片特殊处理
    for (const pChild of newChild) {
      const { node, src, alt } = pChild["props"] || {}
      if (node && node.tagName == "img") { // 图片处理
        imgArr.push((renderImg({ src, alt })))
        continue
      }
      tagArr.push(pChild)
    }
    return { tagArr, imgArr }
  }


  // Tooltip 文字提示
  const rendeTooltip = (sourceArr: any) => {
    // console.log("sourceArr",sourceArr,citations)
    return (
      <>
        {citations && sourceArr?.map((item: any, sIndex: any) => {
          const { page_content, index } = citations[item]; // 引用内容
          const text = <div className="source_pop">{renderText(page_content)}</div>;
          return (
            <Popover content={text} key={sIndex}>
              <span className="source_item_num">{index}</span>
            </Popover>
          );
        })}
      </>
    );
  };


  // 图片渲染
  const renderImg = (param: any) => {
    const { src, alt } = param;
    return <Image src={src} className="echart_img" alt={alt} />;
  };

  // 图片渲染
  const renderCode = (param: any) => {

    const language = param.className
    if (!language) {
      return <>{param.children}</>
    }
    return <CodeLight data={param.children} language={language} />
  };



  // 特殊标签后面加入引用
  const renderSource = (sParam: any, category: any) => {
    const { node, children } = sParam;
    if (!children || children.length == 0) {
      return null
    }

    // 去掉html 标签
    const { newChild, sourceArr, endChar } = handlerHtmlText(
      children,
      citations
    );

    if (category == "li") {
      const { tagArr, imgArr } = handlerTagImg(newChild)
      return <>
        <li>
          {tagArr}
          {rendeTooltip(sourceArr)}
          {endChar}
        </li>
        {imgArr}
      </>;
    }

    // P 标签渲染
    const { tagArr, imgArr } = handlerTagImg(newChild)
    return <>
      <p>
        {tagArr}
        {rendeTooltip(sourceArr)}
        {endChar}
      </p>
      {imgArr}
    </>

  };


  const isHtmlString = (str: any) => {
    const regex = /<[^>]+>/; // 匹配任意以 < 开头，以 > 结尾的字符串
    return regex.test(str);
  }


  // 调用函数
  const renderText = (text: string) => {
    console.log(text)
    let result = latexReplace(text) // 公式处理



    return (
      <>
        {/* {isHtmlString(result || "") &&
          <div
            contentEditable={false}
            spellCheck={false} // 禁止红色波浪线
            dangerouslySetInnerHTML={{ __html: result }}
          />
        } */}

         <ReactMarkdown
          className="react_markdown_1"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex,rehypeRaw]}
          components={{
            li: (param: any) => renderSource(param, "li"),
            p: (param: any) => renderSource(param, "p"),
            code: (param: any) => renderCode(param),
            img: (param: any) => renderImg(param),
          }}
        >
          {result}
        </ReactMarkdown>
 

        <div className="copy" onClick={() => copyText(text)}>
          <CopyOutlined /> 复制
        </div>
      </>
    );
  };



  const decodeURI = (param: any) => {
    try {
      const dURL = decodeURIComponent(param);
      return dURL
    } catch (err: any) {
      return param
    }
  }




  // 文件引用
  const renderCitations = () => {


    let docIdMap = citationDoc
    return (
      <div className="citations">
        <div className="citations_title">引用情况</div>
        {Object.keys(docIdMap)?.map((name: any) => {
          const pageArr = docIdMap[name]
          return (
            <div key={name}>

              {decodeURI(name)}:
              {pageArr?.map((content: any, index: any) => {
                const text = <div className="source_pop">{renderText(content)}</div>;
                return (
                  <Popover content={text} key={index + name}>
                    <a className="citations_item">{index + 1}</a>
                  </Popover>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <>
      <div className="markdown_container">
        {renderText(text)}
        {citations && renderCitations()}
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(CustomMarkdown);
