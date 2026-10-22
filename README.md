# BarberFlow — Agendamentos para barbearias

Site responsivo em HTML, CSS e JavaScript, sem dependências de instalação.

## Como abrir

1. Extraia o ZIP.
2. Abra `index.html` no navegador.
3. Para hospedar na Vercel, importe a pasta (ou envie os arquivos para um repositório no GitHub e conecte-o à Vercel). Escolha "Other" / projeto estático, sem build command. O arquivo de entrada é `index.html`.

## Funcionalidades

- Calendário semanal e horários de acordo com a duração de cada serviço.
- Diferentes profissionais e prevenção de reservas sobrepostas por profissional.
- Cadastro, edição e pesquisa de clientes.
- Criação e edição de agendamentos, cancelamento, conclusão e reativação quando disponível.
- Painel com contadores, faturamento de serviços concluídos e gráfico de movimentação.
- Configuração de nome, horários de funcionamento, dias da semana, profissionais, serviços e preços.
- Backup JSON exportável e importável manualmente.
- Layout glassmorphism animado e responsivo para celular, tablet e desktop.

## IMPORTANTE: modo demonstração

Os primeiros dados são **fictícios**, para exibir o funcionamento. Ao adicionar ou modificar registros, os dados são armazenados no **localStorage do próprio navegador**. Eles NÃO ficam sincronizados entre dispositivos, visitantes diferentes, navegadores diferentes ou computadores diferentes. Apagar os dados do navegador pode excluir agendamentos. Use a exportação JSON para criar backups.

**O site não é um produto online multiusuário pronto para uso comercial.** Para clientes agendarem em seus próprios celulares, você receber as reservas em todos os dispositivos, impedir colisões entre navegadores e proteger dados pessoais, é indispensável integrar banco de dados/servidor, controle de acesso, verificação de disponibilidade no backend e políticas de privacidade e proteção de dados.

## Personalização

No próprio site, abra **Configurações** para alterar o nome da barbearia, equipe, serviços, dias e horários.

A identidade visual principal está em `styles.css` (`:root`). As funcionalidades estão em `app.js`.
