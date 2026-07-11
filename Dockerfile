FROM php:8.3-fpm

# Install sistem dependensi
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    zip unzip nginx git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip pdo_mysql

# Konfigurasi Nginx
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

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . /var/www/html
WORKDIR /var/www/html

# Izin folder (Sangat Penting)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependensi (Tanpa hapus vendor agar file tidak hilang)
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Jalankan command persiapan
RUN php artisan config:clear && php artisan cache:clear

# Jalankan Nginx dan PHP-FPM
CMD service nginx start && php-fpm
