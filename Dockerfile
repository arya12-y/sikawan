FROM php:8.3-fpm

# 1. Install sistem dependensi (GD, Zip, MySQL, Nginx)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    zip unzip nginx git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip pdo_mysql

# 2. Konfigurasi Nginx agar Laravel bisa jalan
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

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Copy semua file project ke dalam container
COPY . /var/www/html
WORKDIR /var/www/html

# 5. Berikan akses folder & Install dependensi
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && rm -rf vendor composer.lock \
    && composer update --no-dev --optimize-autoloader --ignore-platform-reqs

# 6. Jalankan command agar Laravel bersih
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# 7. Jalankan Nginx dan PHP-FPM
CMD service nginx start && php-fpm
