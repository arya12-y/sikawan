# Gunakan image PHP dengan ekstensi yang sudah lengkap
FROM php:8.3-apache

# Install ekstensi GD dan sistem dependensi lainnya
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Salin semua file proyek ke dalam container
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Berikan akses folder
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Jalankan instalasi dependensi
RUN composer install --no-dev --optimize-autoloader

# Expose port (Railway butuh ini)
EXPOSE 80
