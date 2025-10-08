# Script para limpar pacotes problemáticos do React Native

Write-Host "Removendo pacotes problemáticos..."

# Remover pacotes que causam conflito
yarn remove lucide-react

Write-Host "Pacotes problemáticos removidos."

# Instalar as versões corretas
Write-Host "Instalando dependências necessárias..."
yarn add react-native-vector-icons lucide-react-native

# Limpar node_modules e cache
Write-Host "Limpando cache e reinstalando dependências..."
Remove-Item -Recurse -Force node_modules
Remove-Item -Force yarn.lock
yarn install

# Reiniciar Metro com cache limpo
Write-Host "Reiniciando Metro Bundler com cache limpo..."
yarn start --reset-cache
