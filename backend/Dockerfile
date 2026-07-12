# Gunakan image PHP yang sudah punya segalanya
FROM php:8.3-fpm

# Install dependensi sistem yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy file Laravel ke container
COPY . .

# Install dependencies Laravel
RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-gd

# Jalankan server
CMD php artisan serve --host=0.0.0.0 --port=$PORT
