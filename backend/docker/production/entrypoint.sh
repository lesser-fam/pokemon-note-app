#!/usr/bin/env sh

set -eu

port="${PORT:-8080}"

case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a number." >&2
        exit 1
        ;;
esac

if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    echo "PORT must be between 1 and 65535." >&2
    exit 1
fi

sed "s/__PORT__/$port/g" /etc/apache2/ports.conf.template > /etc/apache2/ports.conf
sed "s/__PORT__/$port/g" /etc/apache2/sites-available/000-default.conf.template > /etc/apache2/sites-available/000-default.conf

php artisan optimize --no-interaction
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
