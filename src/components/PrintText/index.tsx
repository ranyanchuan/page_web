import { useEffect, useRef, useState } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm"; // 表格
import "katex/dist/katex.min.css";
import "./index.less";
import { latexReplace } from '@/utils';

const App = (props: any) => {

  const ref = useRef()
  // const [printStatus, setPrintStatus] = useState("");

  useEffect(() => {
    const chat = ref.current
    const content = props?.content || ""
    if (props.isPrint) { // 是否执行打印
      printText(chat, content)
    }
  }, [])

  /**
   * @description:
   * @param {HTMLElement} dom - 打印内容的dom
   * @param {string} content - 打印文本内容
   * @param {number} speed - 打印速度
   * @return {void}
   */
  function printText(dom, content, speed = 15) {
    let index = 0
    setCursorStatus(dom, 'typing')
    let printInterval = setInterval(() => {
      dom.innerText += content[index]
      index++
      props?.scrollChart?.()
      if (index >= content.length) {
        setCursorStatus(dom, 'end')
        props?.scrollChart?.()
        clearInterval(printInterval)
      }
    }, speed)
  }

  /**
   * @description: 设置dom的光标状态
   * @param {HTMLElement} dom - 打印内容的dom
   * @param {"loading"|"typing"|"end"} status - 打印状态
   * @return {void}
   */
  function setCursorStatus(dom, status) {
    props?.updPrintStatus(status == "end" ? false : true) // 
    const classList = {
      loading: 'typing blinker',
      typing: 'typing',
      end: '',
    }
    // setPrintStatus(status)
    dom.className = classList[status]
  }



  return (
    <div className='print_container'>
      <div ref={ref}></div >
      {!props?.isPrint && !ref?.current?.textContent && <div>
        <ReactMarkdown
          className="react_markdown_1"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >{latexReplace(props?.content || "")}</ReactMarkdown>
        </div>
        }
    </div>
  );
};

export default App;
