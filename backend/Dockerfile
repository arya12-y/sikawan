FROM php:8.3-fpm

# Install dependensi sistem
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Salin semua file ke working directory
COPY . .

# Set permission (PENTING untuk Laravel)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies (gunakan --ignore-platform-reqs agar tidak rewel)
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# PERBAIKAN DI SINI: Tidak perlu cd karena kita sudah di /var/www/html
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
