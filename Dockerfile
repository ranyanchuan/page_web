FROM nginx:latest

#author
#MainTAINER zhujun
#把当前html目录下的静态页面文件，copy到镜像中的/usr/share/nginx/html目录下
#COPY html/  /usr/share/nginx/html
COPY ./dist /usr/share/nginx/html/
EXPOSE 80
