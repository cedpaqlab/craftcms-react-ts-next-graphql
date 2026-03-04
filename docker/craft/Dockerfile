FROM php:8.2-apache

# Installation des dépendances système et extensions PHP requises par Craft CMS 4
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) \
    bcmath \
    intl \
    gd \
    mbstring \
    pdo_mysql \
    zip \
  && a2enmod rewrite \
  && rm -rf /var/lib/apt/lists/*

# Installation de Composer depuis l'image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Bootstrap du projet Craft CMS dans l'image (environnement de démo)
RUN composer create-project craftcms/craft . --no-interaction --no-ansi --no-progress --prefer-dist \
  && rm -f .env

# DocumentRoot Apache sur le dossier web de Craft
RUN sed -i 's#/var/www/html#/var/www/html/web#' /etc/apache2/sites-available/000-default.conf

# Droits écriture pour le serveur web (config, storage, cpresources)
RUN chown -R www-data:www-data /var/www/html/config /var/www/html/storage /var/www/html/web/cpresources 2>/dev/null || true \
  && mkdir -p /var/www/html/web/cpresources && chown -R www-data:www-data /var/www/html/web/cpresources

COPY docker/craft/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

