FROM php:8.3-apache

# 1. Install sistem dependensi yang dibutuhkan PHP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip pdo_mysql

# 2. Perbaikan Error AH00534 (MPM Conflict)
RUN a2dismod mpm_event mpm_worker mpm_prefork || true
RUN a2enmod mpm_prefork

# 3. Konfigurasi Apache agar menunjuk ke folder 'public' Laravel
RUN rm /etc/apache2/sites-enabled/000-default.conf
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf
RUN a2ensite 000-default.conf

# 4. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Salin semua file proyek
COPY . /var/www/html

# 6. Set working directory & Izin folder
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 7. Aktifkan mod_rewrite (PENTING untuk routing Laravel)
RUN a2enmod rewrite

# 8. Jalankan instalasi dependensi (paksa ignore ekstensi jika perlu)
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# 9. Jalankan migrasi & cache (agar aplikasi siap jalan)
RUN php artisan config:cache && php artisan route:cache

# 10. Expose port
EXPOSE 80
