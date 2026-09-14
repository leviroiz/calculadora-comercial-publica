FROM nginx:alpine

# Remove the default welcome and error pages from the image.
RUN rm -rf /usr/share/nginx/html/*

COPY index.html styles.css app.js calculator.js rules.js theme.js /usr/share/nginx/html/
COPY assets/demo-mark.svg /usr/share/nginx/html/assets/demo-mark.svg

EXPOSE 80
