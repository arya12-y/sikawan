FROM php:8.3-fpm

# 1. Install sistem dependensi (termasuk Node.js untuk build React)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    zip unzip nginx git nodejs npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip pdo_mysql

# 2. Konfigurasi Nginx untuk Laravel
RUN echo 'server {\n\
    listen 80;\n\
    index index.php index.html;\n\
    root /var/www/html/public;\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
    location ~ \.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_index index.php;\n\
        include fastcgi_params;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
    }\n\
}' > /etc/nginx/sites-available/default

# 3. Setup Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Salin kode project
COPY . /var/www/html
WORKDIR /var/www/html

# 5. Build Aset (Composer + NPM) & Permission
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs \
    && npm install \
    && npm run build

# 6. Cache Artisan agar aplikasi cepat
RUN php artisan config:cache && php artisan route:cache

# 7. Start Nginx & PHP-FPM
CMD service nginx start && php-fpm
