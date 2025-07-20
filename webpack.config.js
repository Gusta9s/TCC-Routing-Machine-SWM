// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  // Determina se estamos em modo de produção ou desenvolvimento
  const isProduction = argv.mode === 'production';

  return {
    // Modo de operação: 'development' ou 'production'
    // Isso habilita otimizações padrão para cada ambiente.
    mode: isProduction ? 'production' : 'development',

    // Ponto de entrada da aplicação
    // O Webpack começará a construir o gráfico de dependências a partir daqui.
    entry: './src/js/main.js',

    // Configuração da saída
    // Onde o Webpack irá gerar os arquivos finais (o "bundle").
    output: {
      // Nome do arquivo de saída. [contenthash] ajuda no cache do navegador.
      filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
      // Caminho absoluto para o diretório de saída.
      path: path.resolve(__dirname, 'dist'),
      // Limpa o diretório 'dist' antes de cada build para remover arquivos antigos.
      clean: true,
      // Garante que os caminhos dos assets estejam corretos.
      assetModuleFilename: 'assets/[hash][ext][query]'
    },

    // Configuração do servidor de desenvolvimento
    devServer: {
      static: {
        // Diretório base para o servidor.
        directory: path.join(__dirname, 'dist'),
      },
      // Habilita a compressão gzip para um carregamento mais rápido.
      compress: true,
      // Porta em que o servidor irá rodar.
      port: 3004,
      // Abre o navegador automaticamente quando o servidor inicia.
      open: true,
      // Habilita o Hot Module Replacement (HMR) para atualizações sem recarregar a página.
      hot: true,
    },

    // Regras de como o Webpack deve tratar diferentes tipos de arquivos.
    module: {
      rules: [
        // Regra para arquivos JavaScript
        {
          test: /\.js$/, // Aplica a regra para todos os arquivos .js
          exclude: /node_modules/, // Ignora a pasta node_modules
          use: {
            loader: 'babel-loader', // Usa o Babel para transpilar o código
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        // Regra para arquivos CSS e SCSS/Sass
        {
          test: /\.(c|sc|sa)ss$/i, // Aplica a regra para .css, .scss, .sass
          use: [
            'style-loader', // 3. Injeta os estilos no DOM através de uma tag <style>
            'css-loader',   // 2. Interpreta @import e url() como import/require
            'sass-loader'   // 1. Compila Sass para CSS
          ],
        },
        // Regra para arquivos de imagem
        {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource', // Trata imagens como assets separados
        },
      ],
    },

    // Plugins que estendem as funcionalidades do Webpack
    plugins: [
      // Plugin para gerar o arquivo HTML automaticamente
      new HtmlWebpackPlugin({
        title: 'TCC-Routing-Machine-SWM', // Título da página
        template: './src/index.html', // Arquivo de template HTML
        filename: 'index.html', // Nome do arquivo de saída
        // Injeta os scripts no final do body
        inject: 'body',
      })],

    // Gera Source Maps para facilitar o debug, mapeando o código compilado de volta ao original.
    // 'eval-source-map' é rápido para desenvolvimento.
    // 'source-map' é mais detalhado para produção.
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};