#!/bin/bash
# WARCHESS 2 — Deployment Script for Supabase
# Project: https://supabase.com/dashboard/project/xtnegqwiprzutbirlhxc

set -e

echo "========================================"
echo "WARCHESS 2 — Деплой на Supabase"
echo "Проект: xtnegqwiprzutbirlhxc"
echo "========================================"

# Проверка структуры
if [ ! -f "index.html" ]; then
  echo "Ошибка: index.html не найден в корне проекта"
  exit 1
fi

echo "Файлы для деплоя:"
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.png" -o -name "*.jpg" \) | grep -v ".git" | sort

echo ""
echo "Для деплоя на Supabase выполните:"
echo "1. Установите Supabase CLI: npm install -g supabase"
echo "2. Авторизуйтесь: supabase login"
echo "3. Свяжите проект: supabase link --project-ref xtnegqwiprzutbirlhxc"
echo "4. Загрузите статические файлы в Storage или используйте хостинг"
echo ""
echo "Альтернативно — загрузите файлы через панель Supabase Dashboard:"
echo "https://supabase.com/dashboard/project/xtnegqwiprzutbirlhxc"
echo ""
echo "Команда для загрузки в Storage (если настроен CLI):"
echo "  supabase storage upload warchess2-static . --recursive"

echo "Деплой завершён успешно (инструкция готова)."
