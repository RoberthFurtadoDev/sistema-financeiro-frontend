# Sistema de Controle Financeiro Pessoal - Frontend (Angular)

Este é o projeto frontend para o Sistema de Controle Financeiro Pessoal, desenvolvido com Angular. Ele fornece a interface do usuário para interagir com a API REST do backend, permitindo aos usuários gerenciar suas finanças de forma intuitiva e visual.

## Funcionalidades Implementadas

* **Autenticação e Autorização:**
  * **Login com E-mail e Senha:** O usuário pode acessar o sistema utilizando seu e-mail cadastrado e senha.
  * **Registro de Usuários:** Novos usuários podem criar uma conta.
  * **Recuperação de Senha:** Funcionalidade completa para "Esqueci minha senha", incluindo envio de e-mail com link de redefinição e notificação por e-mail após a mudança de senha.
  * **Logout:** Botão de sair convenientemente localizado na barra de navegação.
* **Gestão Financeira:**
  * **Dashboard Interativo:** Visão geral rápida do balanço atual, receitas e despesas do mês, além de gráficos rápidos de despesas e receitas por categoria.
  * **Gerenciar Categorias:** CRUD (Criar, Ler, Atualizar, Deletar) completo para categorias de receitas e despesas.
  * **Gerenciar Transações:** CRUD completo para registrar e acompanhar entradas e saídas financeiras.
  * **Relatórios Financeiros Detalhados:** Visualização do balanço geral, filtro de transações por período e categoria, e gráficos avançados de despesas e receitas.
* **Utilidades:**
  * **Consulta de Câmbio:** Integração com uma API externa para consultar taxas de câmbio de diversas moedas.
  * **Configurações do Usuário:** O próprio usuário pode atualizar seus dados cadastrais (nome de usuário e e-mail).
* **Interface do Usuário (UI):**
  * **Design Moderno:** Estilização alinhada com o design da Granatum (cores, fontes, botões, cards).
  * **Responsividade Avançada:** Layout adaptável para dispositivos desktop e mobile, incluindo um menu hambúrguer na barra de navegação para telas pequenas.
  * **Navbar Fixo:** A barra de navegação permanece visível ao rolar a página.

## Tecnologias Utilizadas

* **Framework:** Angular (versão 20.0.0)
* **Linguagem:** TypeScript
* **Gerenciamento de Pacotes:** npm
* **Gráficos:** `ng2-charts` (para integração Angular) e `Chart.js` (para renderização dos gráficos), `chartjs-plugin-datalabels` (para rótulos nos gráficos).
* **Autenticação:** `jwt-decode` (para decodificação de JWT no frontend).
* **Estilização:** CSS nativo com variáveis CSS (`:root`), Flexbox, Grid e Media Queries para responsividade.
* **Build:** Angular CLI

## Como Rodar o Projeto Localmente

1.  **Pré-requisitos:**
  * Node.js e npm instalados (verifique com `node -v` e `npm -v`).
  * Angular CLI instalado (verifique com `ng version`). Se não estiver, instale globalmente: `npm install -g @angular/cli`.
  * **Certifique-se de que o backend Spring Boot esteja rodando e acessível em `http://localhost:8081`.**

2.  **Clone o repositório do Frontend:**
    ```bash
    git clone [https://github.com/RoberthFurtadoDev/sistema-financeiro-frontend.git](https://github.com/RoberthFurtadoDev/sistema-financeiro-frontend.git) # (ou a URL real do seu repositório frontend)
    cd sistema-financeiro-frontend
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configurar a URL da API (Desenvolvimento):**
  * O frontend está configurado para apontar para `http://localhost:8081/api` no ambiente de desenvolvimento. Você pode verificar isso em `src/environments/environment.ts`. Se o seu backend estiver em outra porta, ajuste este arquivo.

5.  **Execute a aplicação:**
    ```bash
    ng serve --open
    ```
    Isso abrirá o aplicativo no seu navegador em `http://localhost:4200/`.

## Decisões Técnicas no Frontend

Durante o desenvolvimento deste frontend Angular, várias decisões técnicas foram tomadas para garantir que o sistema fosse **moderno, eficiente, escalável e fácil de manter**.

1.  **Angular Standalone Components:**
  * **Motivo:** Escolhi o modelo de componentes `standalone: true` (recurso introduzido no Angular 14 e padrão a partir do Angular 17). Isso proporciona maior modularidade, melhora a capacidade de "tree-shaking" (reduzindo o tamanho final do bundle da aplicação, pois o compilador remove o código não utilizado de forma mais eficaz) e simplifica a organização do código, eliminando a necessidade de `NgModule`s para cada pequena parte da aplicação.
  * **Impacto:** Permitiu que cada componente fosse autocontido em suas dependências, resultando em um código mais limpo e testes mais focados.

2.  **Arquitetura Baseada em Serviços (`Service-based Architecture`):**
  * **Motivo:** A lógica de comunicação com o backend (HTTP requests) e a manipulação de dados que são compartilhados entre componentes são centralizadas em serviços `@Injectable`. Isso separa as responsabilidades (Single Responsibility Principle - SRP).
  * **Impacto:** Componentes ficam mais leves, focados apenas na lógica de UI, e a lógica de negócio pode ser reutilizada e testada de forma independente. Ex: `AuthService`, `ReportService`, `UserService`.

3.  **Roteamento com `Angular Router` e `Auth Guards`:**
  * **Motivo:** Para criar uma Single Page Application (SPA), o `Angular Router` é essencial para gerenciar a navegação entre diferentes views sem recarregar a página inteira. `Auth Guards` (`canActivate`) foram usados para proteger rotas, garantindo que apenas usuários autenticados possam acessar determinadas partes do sistema.
  * **Impacto:** Navegação fluida e segura, com controle de acesso baseado no estado de autenticação do usuário.

4.  **Autenticação Baseada em JWT com `HttpInterceptor`:**
  * **Motivo:** Para interagir com o backend seguro via JWT (JSON Web Tokens). O token é armazenado no `localStorage` após o login. Um `HttpInterceptor` é usado para interceptar *todas* as requisições HTTP de saída, injetando automaticamente o token JWT no cabeçalho `Authorization` (Bearer Token). Ele também lida com erros `401 Unauthorized` (token inválido/expirado), redirecionando o usuário para a tela de login.
  * **Impacto:** Mecanismo de autenticação e autorização robusto, seguro (token stateless) e eficiente, com tratamento global de erros de autenticação.

5.  **Estilização com Variáveis CSS e Abordagem Responsiva (`Mobile-First`):**
  * **Motivo:** Adotar um design moderno e adaptável. Variáveis CSS (`:root` com `--primary-granatum-blue`, `--spacing-md`, etc.) foram usadas para criar uma paleta de cores e espaçamentos consistentes em toda a aplicação, facilitando a manutenção e a theming. Flexbox e Grid (`display: flex`, `display: grid`) são amplamente utilizados para layouts flexíveis, combinados com `media queries` para adaptar a interface a diferentes tamanhos de tela (desktop, tablet, mobile).
  * **Impacto:** O sistema é visualmente atraente e utilizável em qualquer dispositivo, com uma base de estilo fácil de expandir ou modificar. A recriação do `login-card` com sombras e bordas arredondadas, e o menu hambúrguer, são exemplos disso.

6.  **Visualização de Dados com `ng2-charts` e `Chart.js`:**
  * **Motivo:** Para apresentar dados financeiros de forma visual e compreensível (gráficos de pizza e barra). `ng2-charts` atua como uma ponte Angular para a poderosa biblioteca `Chart.js`.
  * **Impacto:** Gráficos interativos com tooltips customizados (mostrando valores em moeda formatada) e rótulos de dados (`chartjs-plugin-datalabels`), tornando os relatórios e o dashboard mais informativos. A configuração global dos plugins em `main.ts` garante que todos os gráficos os utilizem.

7.  **Gerenciamento de Estado Simplificado:**
  * **Motivo:** Para um projeto deste porte, um gerenciamento de estado mais complexo (como NgRx ou Akita) não foi considerado necessário para evitar sobrecarga. O estado é gerenciado diretamente nas propriedades dos componentes e via Observables de RxJS nos serviços.
  * **Impacto:** Desenvolvimento mais rápido para funcionalidades básicas, mantendo a reatividade sem a complexidade de uma store centralizada.

## Como Contribuir

* Faça um fork do repositório.
* Crie uma nova branch para sua feature (`git checkout -b feature/minha-nova-funcionalidade`).
* Faça suas alterações e adicione testes (se aplicável).
* Envie um Pull Request.

---
💻 Desenvolvido por: Roberth Furtado © 2025 | Todos os direitos reservados.
