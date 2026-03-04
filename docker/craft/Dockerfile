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

# Bootstrap Craft dans un répertoire de seed (copié vers volume au 1er démarrage)
WORKDIR /tmp
RUN composer create-project craftcms/craft craft-app --no-interaction --no-ansi --no-progress --prefer-dist \
  && rm -f craft-app/.env

WORKDIR /var/www/html

# DocumentRoot Apache sur le dossier web de Craft
RUN sed -i 's#/var/www/html#/var/www/html/web#' /etc/apache2/sites-available/000-default.conf

COPY docker/craft/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

