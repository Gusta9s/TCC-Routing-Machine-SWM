# Estágio 1: Build das dependências (Builder)
FROM node:18-slim AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# **A CORREÇÃO ESTÁ AQUI**
# Dá a posse do diretório /app para o usuário 'node' (que já existe na imagem)
RUN chown -R node:node /app

# Muda para o usuário 'node'
USER node

# Executa o 'npm install' como usuário 'node', que agora tem permissão para escrever em /app
RUN npm install

# ---

# Estágio 2: Imagem final de produção
FROM node:18-slim

# Instala as dependências de sistema do Puppeteer na imagem final
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    lsb-release wget xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia o código da aplicação e define o 'node' como dono
COPY --chown=node:node server.js .

# Copia as dependências e o cache do navegador do estágio anterior
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /home/node/.cache /home/node/.cache

# Garante que o diretório de assets exista e pertença ao usuário 'node'
RUN mkdir -p assets/images && chown -R node:node assets

# Muda para o usuário 'node' para executar a aplicação
USER node

EXPOSE 3004

CMD [ "node", "server.js" ]