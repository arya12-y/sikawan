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

# Copy file Laravel
COPY . .

# Set permission agar Laravel bisa nulis di storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies dengan mengabaikan requirement platform agar tidak crash
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Jalankan server
CMD php artisan serve --host=0.0.0.0 --port=$PORT
