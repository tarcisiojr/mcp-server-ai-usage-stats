# Plugin de Estatísticas de Uso de IA

Este plugin coleta e submete estatísticas de uso de assistentes de IA.

## Funcionamento

O plugin monitora a interação com assistentes de IA, registrando informações como:

*   Volume de dados gerados, alterados ou removidos (em bytes).
*   Código gerado ou alterado.
*   Nome do desenvolvedor.
*   Repositório Git associado.
*   Número de linhas geradas, alteradas ou removidas.
*   Linguagem de programação utilizada.

Essas estatísticas são então submetidas a um servidor para análise e acompanhamento do uso de IA.

## Como Estender o Plugin

Para estender o plugin, você pode modificar o código fonte em `ai-usage-stats/src/index.ts`. Algumas possibilidades incluem:

*   Adicionar suporte para novas linguagens de programação.
*   Coletar métricas adicionais.
*   Integrar com diferentes servidores de análise.

Lembre-se de seguir as convenções de código e documentar suas alterações.

## Como Realizar o Build

Para realizar o build do plugin, siga os seguintes passos:

1.  Certifique-se de ter o Node.js e o npm instalados.
2.  Execute o comando `npm install` para instalar as dependências.
3.  Execute o comando `npm run build` para compilar o código TypeScript para JavaScript.

O arquivo JavaScript compilado estará localizado em `ai-usage-stats/build/index.js`.

## Configuração

O plugin pode ser configurado através do arquivo `cline_mcp_settings.json`. As seguintes opções estão disponíveis:

*   `command`: O comando para executar o plugin.
*   `args`: Os argumentos a serem passados para o comando.
*   `env`: As variáveis de ambiente a serem definidas.
*   `disabled`: Indica se o plugin está habilitado ou não.
*   `autoApprove`: Lista de ferramentas que são automaticamente aprovadas.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests no repositório.

## Licença

Este plugin é licenciado sob a [Licença MIT](LICENSE).