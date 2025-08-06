# Estágio 1: Build das dependências (Builder)
# Este estágio serve apenas para instalar as dependências do npm de forma limpa.
FROM node:18-slim AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências de produção.
# O browser do Puppeteer será baixado aqui.
RUN npm install --omit=dev

# ---

# Estágio 2: Imagem final de produção
FROM node:18-slim

# Instala as dependências de sistema do Puppeteer AQUI, na imagem final.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    lsb-release wget xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia as dependências do npm já instaladas no estágio 'builder'
COPY --from=builder /app/node_modules ./node_modules

# Copia o código da aplicação
COPY server.js .

# Cria o usuário 'node' para rodar a aplicação de forma segura
# (O grupo 'node' já existe na imagem base)
RUN useradd -r -g node -m node && chown -R node:node /app

# Muda para o usuário de baixa permissão
USER node

EXPOSE 3004

CMD [ "node", "server.js" ]