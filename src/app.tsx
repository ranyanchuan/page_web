import { history } from "umi";


/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  // loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState() {
  return {
    navTheme: "light",
    layout: "mix",
    contentWidth: "Fluid",
    fixedHeader: false,
    fixSiderbar: false,
    headerHeight: 48,
    primaryColor: "#1890ff",
    splitMenus: false,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = (props: any) => {
  const { initialState, setInitialState } = props;
  //todo 不同路由处理
  return {
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    onPageChange: () => {
    },
    menuRender: false,
    links: [],
    contentStyle: { padding: 0 },
    childrenRender: (children: any, props: any) => {

      // todo 根据 url 不通header
      const cRouter=history.location.pathname
      // console.log("cRouter",cRouter)
      // 排除登录
      const excludeRoute=["/login"]
      if(excludeRoute.findIndex(d=>cRouter.includes(d)) !== -1){
        return <div>
          {children}
        </div>
      }
     

      return <>
        <div className="layout_kd_work">
          <div className="content_children">{children}</div>
          <div>
          </div>
        </div>

      </>;
    },
    ...initialState?.settings,
    title: "AIWorkflow",
    headerRender: false,
    headerContentRender: false
  };
};
