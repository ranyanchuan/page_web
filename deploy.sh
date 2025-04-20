#!/bin/bash

# 部署命令为：sh deploy.sh 目标   （不输入参数时  默认部署到workflow）
# 目标可以是：workflow、cqu、zhy、cmic

# 定义有效参数列表
VALID_PARAMS=("workflow" "cqu" "zhy" "cmic")

# 默认值
DEFAULT_PARAM="workflow"

# 检查是否传入参数
if [ -z "$1" ]; then
  # 如果没有传入参数，使用默认值
  PARAM=$DEFAULT_PARAM
else
  # 如果传入了参数，检查参数是否有效
  PARAM=$1
  if [[ ! " ${VALID_PARAMS[@]} " =~ " ${PARAM} " ]]; then
    echo "参数无效: $PARAM"
    echo "有效参数如下: ${VALID_PARAMS[*]}"
    exit 1
  fi
fi
# 创建构建命令
BUILD_COMMAND="yarn build:$PARAM"
# 执行构建命令
eval $BUILD_COMMAND

# 获取构建命令的退出状态
BUILD_EXIT_STATUS=$?

# 检查构建是否成功
if [ $BUILD_EXIT_STATUS -eq 0 ]; then
  echo "Build succeeded!"
  scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/$PARAM  

else
  echo "Build failed!"
  exit 1
fi

# scp -r ./dist/* root@192.168.6.77:/usr/share/nginx/html/workflow
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/workflow #主站prod
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/cqu  #重庆大学
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/zhy  #中海油
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/cmic  #中移互
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/cmickb  #：中国移动互联网卡部
# scp -r ./dist/* zhaohuijun@10.0.0.19:/data/nginx/html/sfz  #首都发展集团


#passWord： wodemimashi123
# http://jixun.iqihang.com/statics/js/pdf.worker_2.1.266.js
