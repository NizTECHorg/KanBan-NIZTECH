# Crumbs & Co. — Sistema de Gestão para Confeitaria de Cookies

## Objetivo

Desenvolver um aplicativo mobile moderno para gerenciamento completo de uma confeitaria especializada em cookies artesanais. O sistema deve permitir controlar pedidos, produção, estoque, entregas, clientes e indicadores do negócio em um único lugar.

O foco é criar uma solução que possa ser facilmente adaptada para qualquer empresa de produção alimentícia (brownies, doces, bolos, cafeterias, padarias, etc.).

---

# Identidade da Empresa

## Nome

Crumbs & Co.

## Segmento

Confeitaria especializada em cookies artesanais premium.

## Público-alvo

- Lojas físicas
- Delivery
- Cafeterias
- Franquias
- Produção artesanal

## Identidade Visual

Estilo moderno, minimalista e premium.

Paleta:

- Chocolate (#4A2C2A)
- Caramelo (#C27A42)
- Creme (#F5E7D3)
- Fundo escuro (#141414)

O aplicativo deve seguir um design elegante semelhante ao Stripe, Notion, Linear e Apple, utilizando bastante espaço em branco (ou preto, no tema escuro), cantos arredondados e animações suaves.

---

# Tecnologias

- React Native (Expo)
- TypeScript
- Expo Router
- Supabase
- PostgreSQL
- React Query
- Zustand
- NativeWind (Tailwind)
- React Hook Form
- Zod
- Reanimated
- Victory Native (gráficos)

Arquitetura organizada por módulos.

---

# Tema

Dark Mode como padrão.

O sistema deve possuir aparência premium.

Evitar excesso de cores.

Utilizar apenas uma cor principal para ações.

Botões grandes.

Cards modernos.

Animações suaves.

---

# Estrutura do Sistema

## Dashboard

Tela inicial com indicadores do dia.

Informações:

- Pedidos do dia
- Produção pendente
- Cookies vendidos
- Faturamento diário
- Clientes atendidos
- Produtos com estoque baixo
- Ingredientes críticos
- Gráfico de vendas

---

# Pedidos

Cadastro completo de pedidos.

Cada pedido possui:

- Cliente
- Telefone
- Produtos
- Quantidade
- Observações
- Forma de pagamento
- Status
- Tipo de entrega
- Horário
- Valor

Status:

- Novo
- Produção
- Pronto
- Saiu para entrega
- Entregue
- Cancelado

Filtros:

- Hoje
- Amanhã
- Semana
- Produção
- Entregues

---

# Produção

A produção deve ser automática.

Sempre que pedidos forem confirmados, o sistema calcula a quantidade necessária de cada cookie.

Exemplo:

Produzir hoje:

- 35 Chocolate Chips
- 18 Nutella
- 12 Red Velvet
- 9 Pistache

Cada produção pode ser marcada como concluída.

Também deve existir histórico de produção.

---

# Produtos

Cadastro de produtos.

Campos:

- Nome
- Categoria
- Descrição
- Foto
- Peso
- Preço
- Tempo médio de produção
- Ativo/Inativo

Categorias:

- Cookies
- Brownies
- Bebidas
- Cafés
- Combos

---

# Receitas

Cada produto possui sua receita.

Exemplo:

Chocolate Chips

- 180g Farinha
- 90g Manteiga
- 100g Chocolate
- 60g Açúcar

Essas receitas serão utilizadas para descontar automaticamente os ingredientes do estoque.

---

# Estoque

Controle completo dos ingredientes.

Cada ingrediente possui:

- Nome
- Unidade
- Quantidade atual
- Quantidade mínima
- Fornecedor

Quando um pedido for confirmado:

- descontar ingredientes automaticamente

Quando atingir estoque mínimo:

- gerar alerta

---

# Lista de Compras

O sistema deve gerar automaticamente uma lista de compras baseada no estoque mínimo.

Exemplo:

Comprar:

- 8kg Farinha
- 3kg Chocolate
- 5kg Açúcar
- 4kg Manteiga

---

# Clientes

Cadastro completo.

Campos:

- Nome
- Telefone
- Email
- Data de nascimento
- Endereço

Histórico:

- Pedidos
- Valor gasto
- Última compra

Sistema de fidelidade:

Bronze

Prata

Ouro

Diamante

---

# Entregas

Gerenciamento das entregas.

Cada entrega possui:

- Entregador
- Pedidos
- Horário
- Status

Status:

- Aguardando
- Em rota
- Entregue

Possibilidade de agrupar vários pedidos em uma mesma rota.

---

# Financeiro

Dashboard financeiro.

Indicadores:

- Receita diária
- Receita mensal
- Lucro
- Despesas
- Ticket médio

Gráficos:

- Receita por dia
- Receita mensal
- Produtos mais vendidos

---

# Promoções

Cadastro de cupons.

Campos:

- Código
- Desconto
- Validade
- Limite de uso

---

# Funcionários

Tipos:

Administrador

Gerente

Atendente

Confeiteiro

Entregador

Cada perfil possui permissões específicas.

---

# Configurações

Empresa

Logo

Nome

Telefone

Endereço

Horário de funcionamento

Taxa de entrega

Usuários

Backup

---

# Relatórios

Gerar automaticamente:

Produtos mais vendidos

Produtos menos vendidos

Clientes que mais compram

Lucro por produto

Receita mensal

Ingredientes mais utilizados

Produção por período

---

# Notificações

Notificações internas para:

Novo pedido

Produção concluída

Ingrediente acabando

Entrega atrasada

Novo cliente

---

# Banco de Dados

Tabelas sugeridas:

- users
- clients
- products
- categories
- recipes
- recipe_items
- ingredients
- stock
- orders
- order_items
- production
- deliveries
- delivery_items
- coupons
- employees
- expenses
- reports

Utilizar PostgreSQL normalizado.

Todas as tabelas devem possuir:

- id
- created_at
- updated_at

---

# Regras de Negócio

- Confirmar pedido gera produção automaticamente.
- Produção concluída reduz estoque.
- Estoque baixo gera alerta.
- Pedido entregue atualiza histórico do cliente.
- Cancelamento devolve estoque caso a produção ainda não tenha iniciado.
- Apenas administradores podem excluir registros.
- Todo histórico deve permanecer salvo.

---

# UX/UI

Seguir um design moderno.

Inspirado em:

- Stripe
- Linear
- Notion
- Apple
- Vercel Dashboard

Características:

- Interface limpa
- Pouco texto
- Cards arredondados
- Ícones minimalistas
- Animações suaves
- Tema escuro
- Excelente espaçamento
- Navegação simples

---

# Objetivo Final

Construir um aplicativo que pareça um SaaS profissional, pronto para comercialização, demonstrando domínio de arquitetura, experiência do usuário, banco de dados, gestão de negócios e desenvolvimento mobile.

O sistema deve ser facilmente adaptável para outros segmentos alimentícios apenas alterando a identidade visual e algumas regras de negócio.