FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    git curl libpng-dev libzip-dev zip unzip postgresql-dev \
    supervisor linux-headers $PHPIZE_DEPS

RUN docker-php-ext-install pdo pdo_pgsql pgsql zip gd bcmath opcache pcntl sockets

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

COPY php.ini /usr/local/etc/php/conf.d/custom.ini
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

USER www-data
