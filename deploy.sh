#!/bin/bash

# Script para build e deploy automático do Paozinho Frontend
# Uso: ./deploy.sh

echo "🚀 Iniciando build e deploy do Paozinho Frontend..."

# Fazer o build
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Copiar arquivos para o diretório do nginx
    echo "📁 Copiando arquivos para o nginx..."
    sudo cp -r dist/* /var/www/paozinhodelicia.humannits.com.br/
    
    # Limpar cache do nginx (opcional)
    echo "🧹 Limpando cache do nginx..."
    sudo systemctl reload nginx
    
    echo "🎉 Deploy concluído com sucesso!"
    echo "🌐 Site disponível em: https://paozinhodelicia.humannits.com.br"
else
    echo "❌ Erro no build. Deploy cancelado."
    exit 1
fi

