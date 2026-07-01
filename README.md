# 📋 Nimbus — Gerenciador de Tarefas

Aplicação de organização de tarefas em formato **Kanban**, com múltiplos quadros e colunas personalizáveis, dashboard de produtividade, calendário, favoritos e histórico completo de alterações.

🔗 **Acesse online:** https://task-manager42.netlify.app/

## ✨ Funcionalidades

- Múltiplos quadros (boards), cada um com ícone, cor e descrição personalizados
- Colunas personalizáveis dentro de cada quadro (criar, editar, colorir)
- Cartões de tarefa com:
  - Descrição, checklist, comentários e anexos simulados
  - Status, prioridade, categoria, responsável e data de entrega
  - Etiquetas coloridas
- Filtros por prioridade, etiqueta, responsável, status e favoritos
- Dashboard com estatísticas gerais, gráfico de progresso e distribuição por prioridade/coluna
- Calendário mensal com visualização de tarefas por data de entrega
- Página de favoritos (quadros e tarefas marcados com estrela)
- Histórico completo de atividades (criação, edição, exclusão, movimentação, etc.)
- Atalhos de teclado (`/` para buscar, `N` para novo quadro, `T` para alternar tema)
- Tema claro/escuro com persistência de preferência
- Persistência de dados via `localStorage` — os dados continuam salvos ao fechar o navegador

## 🛠️ Tecnologias

- **HTML5** — estrutura da aplicação
- **CSS3** — estilização, temas e responsividade
- **JavaScript (Vanilla)** — toda a lógica de estado, renderização e interações
- **LocalStorage** — persistência dos dados no navegador
- **Font Awesome** — ícones

## 📁 Estrutura do projeto

```
gerenciador-tarefas/
├── index.html    # Estrutura da aplicação e dos modais
├── style.css     # Estilos, temas e responsividade
└── script.js     # Lógica de estado, renderização e persistência
```

## ▶️ Como executar localmente

Não é necessário nenhuma instalação ou build. Basta:

1. Baixar os três arquivos (`index.html`, `style.css`, `script.js`) mantendo-os na mesma pasta
2. Abrir o arquivo `index.html` no navegador

## 📌 Observações

- Todos os dados (quadros, tarefas, histórico) ficam salvos localmente no navegador, na chave `nimbus_state_v1` do `localStorage`.
- Usar o botão **"Limpar todos os dados"**, nas configurações, apaga permanentemente tudo o que foi salvo.

---

Desenvolvido por **Antonio Marques** — 2026
