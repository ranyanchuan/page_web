console.log("contentScript.js public______1111111_____")
// console.log("chrome", chrome)



chrome.runtime.onMessage.addListener(async function (request, sender,sendResponse) {
    // 处理接收到的消息
    const { tokens, message } = request
    const {func}=request


    // 显示更多 
    let count=1
    function showMoreMessage(cls,maxCount){    
        let document_list=document.getElementsByClassName(cls) || []
        console.log("count:",count)
        if(document_list.length==0 || count>maxCount){
            return true
        }
        for(const doc of document_list){
            doc.click();
        }
        count=count+1
        setTimeout(()=>showMoreMessage(cls,maxCount),1000)
    }

    
    //  获取当前页面html
    if(func=="getPageHtml"){
        const html = document.body.innerHTML;
        sendResponse(html);
    }
    
    if(func=="getDomHtml"){
        const {id}=request
        const html = document.getElementById(id).innerHTML;
        sendResponse(html);
    }
    
    //  获取加载更多
    if(func=="clickMoreByCls"){
        count=1
        const {cls="show-more",maxCount=3}=request
        showMoreMessage(cls,maxCount)
    }

    //  通过ID点击
    if(func=="onClickById"){
        const {id}=request
        let doc=document.getElementById(id)
        doc.click();
    }

    // 更新浏览器 URL
    if(func=="modifyUrl"){
        try {location.href=request.url} catch (error) {console.log("更新浏览器URL失败：",error)}
    }
    
    // 滚动浏览器
    if(func=="windowScroll"){
        window.scrollBy(0, 2000)
    }

});

