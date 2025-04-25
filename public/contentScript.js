console.log("contentScript.js public______1111111_____")
// console.log("chrome", chrome)


// inject.js
// chrome extension中不能使用console.log
// 所以，需要通过发送请求给后台脚本的方式来打印日志

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    // 处理接收到的消息
    const { tokens, message } = request
    const { func } = request


    // 显示更多 
    let count = 1
    function showMoreMessage(cls, maxCount) {
        let document_list = document.getElementsByClassName(cls) || []
        console.log("count:", count)
        if (document_list.length == 0 || count > maxCount) {
            return true
        }

        function delayLoop(times) {
            let btn_count = 0;
            function loop() {
                if (count < times) {
                    console.log(`循环第 ${btn_count + 1} 次`);
                    document_list[btn_count].click();
                    btn_count++;
                    setTimeout(loop, 500); // 每次等待 5 秒
                }
                if (count > times) {
                    showMoreMessage(cls, maxCount)
                }
            }
            loop();
        }

        delayLoop(document_list.length)
        count = count + 1
    }




    //  获取当前页面html
    if (func == "getPageHtml") {
        const html = document.body.innerHTML;
        sendResponse(html);
    }

    if (func == "getDomHtml") {
        const { id } = request
        const html = document.getElementById(id).innerHTML;
        sendResponse(html);
    }

    //  获取加载更多
    if (func == "clickMoreByCls") {
        count = 1
        const { cls = "show-more", maxCount = 3 } = request
        showMoreMessage(cls, maxCount)
    }

    //  通过ID点击
    if (func == "onClickById") {
        const { id } = request
        let doc = document.getElementById(id)
        doc.click();
    }

    // 更新浏览器 URL
    if (func == "modifyUrl") {
        try { location.href = request.url } catch (error) { console.log("更新浏览器URL失败：", error) }
    }

    // 滚动浏览器
    if (func == "windowScroll") {
        window.scrollBy(0, 3000)
    }


    if (func == "onClickBiliSubTitle") {
        
        let docEle = document.getElementsByClassName("bpx-state-no-cursor")[0]
        docEle.setAttribute('data-ctrl-hidden', 'false');

        document
            .getElementsByClassName("bpx-player-ctrl-btn bpx-player-ctrl-subtitle")[0]
            .getElementsByClassName("bpx-common-svg-icon")[0].click()
    }

    if (func == "getBiliSubtitle") {
        if (!window.performance && !window.performance.getEntries) {
            return false;
        }
        let result = [];
        window.performance.getEntries().forEach((item) => {
            // https://aisubtitle.hdslb.com/bfs/ai_subtitle/
            if (item.name.includes("https://aisubtitle.hdslb.com/bfs/ai_subtitle")) {
                result.push(item.name);
            }
        });
        sendResponse({ "sub_title": result?.[0] || "" })
    }


});

