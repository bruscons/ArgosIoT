// next.config.js
// Configuração principal do Next.js para o projeto Argos

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Variáveis de ambiente expostas ao cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_MQTT_URL: process.env.NEXT_PUBLIC_MQTT_URL || 'ws://localhost:8083',
    NEXT_PUBLIC_MQTT_USERNAME: process.env.NEXT_PUBLIC_MQTT_USERNAME || '',
    NEXT_PUBLIC_MQTT_PASSWORD: process.env.NEXT_PUBLIC_MQTT_PASSWORD || '',
  },
  
  // Domínios permitidos para otimização de imagens
  images: {
    domains: ['localhost'],
  },
  
  // Desabilita o indicador de build em desenvolvimento (opcional)
  devIndicators: {
    buildActivity: true,
  },
}

module.exports = nextConfig
