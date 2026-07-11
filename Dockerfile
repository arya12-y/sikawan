FROM php:8.3-apache

# Install sistem dependensi yang dibutuhkan PHP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Salin semua file proyek
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Berikan akses folder
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Jalankan instalasi dependensi
RUN composer install --no-dev --optimize-autoloader

# Expose port
EXPOSE 80
