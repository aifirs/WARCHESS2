#!/bin/bash
# WARCHESS 2 — Deployment Script for Supabase
# Project: https://supabase.com/dashboard/project/xtnegqwiprzutbirlhxc

set -e

echo "========================================"
echo "WARCHESS 2 — Деплой на Supabase"
echo "Проект: ${SUPABASE_PROJECT_REF:-xtnegqwiprzutbirlhxc}"
echo "========================================"

# Проверка структуры
if [ ! -f "index.html" ]; then
  echo "Ошибка: index.html не найден в корне проекта"
  exit 1
fi

# Список файлов, которые будут загружены
echo "Файлы для деплоя:"
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.png" -o -name "*.jpg" \) | grep -v "\.git" | sort

echo ""

# Если в среде CI/локально заданы переменные SUPABASE_PROJECT_REF и SUPABASE_ACCESS_TOKEN — выполняем автоматический деплой
if [ -n "$SUPABASE_PROJECT_REF" ] && [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Supabase project ref и токен обнаружены — выполняю автоматический деплой через supabase CLI"

  # Установка supabase CLI, если не установлен
  if ! command -v supabase >/dev/null 2>&1; then
    echo "Устанавливаю Supabase CLI..."
    npm install -g supabase
  fi

  echo "Связываю проект..."
  # Не выводим токен в логи
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" supabase link --project-ref "$SUPABASE_PROJECT_REF"

  echo "Загружаю статические файлы в bucket 'warchess2-static' (создайте бакет заранее в Supabase Storage)"
  supabase storage upload warchess2-static . --recursive

  echo "Деплой выполнен через Supabase CLI. Проверьте дашборд для подтверждения."
  exit 0
fi

# Инструкции для ручного деплоя
echo "Для деплоя на Supabase выполните:" 
echo "1. Установите Supabase CLI: npm install -g supabase"
echo "2. Авторизуйтесь: supabase login  (или установите SUPABASE_ACCESS_TOKEN в переменных окружения CI)"
echo "3. Свяжите проект: supabase link --project-ref xtnegqwiprzutbirlhxc" 
echo "4. Загрузите статические файлы в Storage или используйте хостинг"

echo "Альтернативно — загрузите файлы через панель Supabase Dashboard:"
echo "https://supabase.com/dashboard/project/xtnegqwiprzutbirlhxc"

echo "Команда для загрузки в Storage (если настроен CLI):"
echo "  supabase storage upload warchess2-static . --recursive"

echo "Готово."
