# Estágio 1: Build das dependências (Builder)
FROM node:18-slim AS builder

# Cria um diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Dá a posse do diretório /app para o usuário 'node'
RUN chown -R node:node /app

# Muda para o usuário 'node'
USER node

# Executa o 'npm install' que tambem se chama injeção de dependências como usuário 'node'
RUN npm install

# ---

# Estágio 2: Divide para duas imagens diferentes, para instalacao das dependencias da imagem do sistema operacional
FROM node:18-slim

# Instala as dependências de sistema do Puppeteer na imagem final
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    lsb-release wget xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Cria um diretório de trabalho apenas para estas dependências
WORKDIR /app

# Copia o código da aplicação e define o 'node' como dono
COPY --chown=node:node server.js .

# Copia as dependências e o cache do navegador do estágio anterior (Para melhor performance e caso haja atualizacoes nos pacotes instalados ele efetua a reinstalacao novamente)
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /home/node/.cache /home/node/.cache

# Garante que o diretório de assets (recursos) exista e pertença ao usuário 'node'
RUN mkdir -p assets/images && chown -R node:node assets

# Muda para o usuário 'node' para executar a aplicação
#USER node

# Diz ao Puppeteer para usar o cache do usuário 'node', mesmo rodando como 'root'
ENV PUPPETEER_CACHE_DIR=/home/node/.cache/puppeteer

# Inicializa a aplicação na porta 3004
EXPOSE 3004

# Comando para iniciar a aplicação
CMD [ "node", "server.js" ]