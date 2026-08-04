# Estratégia e Especificação do Sistema de E-mails — Coisart

Documento de especificação técnica e funcional para a implementação futura do serviço de e-mails transacionais da plataforma **Coisart** (Marketplace Multi-vendedor e Feira de Artesanato).

---

## 1. Visão Geral

O sistema de e-mails da Coisart tem como objetivo manter clientes e artesãos informados em tempo real sobre o estado das compras, garantindo uma comunicação quente, clara e alinhada com a estética "warm cozy".

O fluxo de comunicação adapta-se dinamicamente aos **4 Métodos de Entrega** da plataforma:
1. ⚡ **Download Digital Instantâneo** (`digital`)
2. ☕ **Levantamento no Ponto Parceiro: Ah Coisas ~ Concept Store (Vila das Aves)** (`cafe_pickup`)
3. 🎪 **Levantamento na Feira Mensal** (`fair_pickup`)
4. 📦 **Envio CTT / Transportadora** (`shipping`)

---

## 2. Matriz de E-mails para o Cliente (Comprador)

### 2.1. Confirmação de Encomenda & Pagamento (`order_confirmation`)
* **Gatilho:** Criado imediatamente após a confirmação do pagamento ou encomenda efetuada com sucesso.
* **Assunto:** `Obrigado pela tua encomenda na Coisart! 🎨 [Encomenda #ID]`
* **Conteúdo:**
  - Resumo dos artigos comprados e valor total em euros.
  - Dados do cliente (Nome, E-mail, Telefone, NIF se facultado).
  - **Bloco Dinâmico por Método de Entrega:**
    - `digital`: Link direto e permanente para download dos ficheiros.
    - `cafe_pickup`: Ah Coisas ~ Concept Store (Praça das Fontaínhas Loja F, 4795-021 Vila das Aves | Tel: 252 093 463) e horário de funcionamento.
    - `fair_pickup`: Data da próxima feira, local e número da banca do artesão.
    - `shipping`: Informação de que a peça está a ser preparada pelo artesão para envio CTT.

### 2.2. Aviso de Encomenda Pendente (`order_pending`)
* **Gatilho:** Quando a encomenda aguarda liquidação por MB WAY ou Transferência Bancária.
* **Assunto:** `A tua encomenda aguarda pagamento — Coisart ⏳`
* **Conteúdo:** Instruções detalhadas de pagamento, montante exato e prazo limite para garantir a reserva da peça única.

### 2.3. Encomenda Enviada / Pronta para Recolha (`order_shipped_or_ready`)
* **Gatilho:** Alteração de estado para enviado ou pronto a recolher.
* **Assunto:** `A tua encomenda Coisart está a caminho! 📦 / Pronta a recolher! ☕`
* **Conteúdo:**
  - *Para Envio CTT:* Código de Rastreio / Número de Registo CTT.
  - *Para Ponto Parceiro / Feira:* Confirmação de que a peça já se encontra disponível para recolha.

### 2.4. Notificação de Reenvio / Re-expedição (`order_resend_notice`)
* **Gatilho:** Quando o Admin ou Vendedor ativa o pisco de **Reenvio** (`isResend: true`) por extravio ou devolução CTT.
* **Assunto:** `Atualização: Novo envio da tua encomenda Coisart 🔁`
* **Conteúdo:** Mensagem explicativa e novo código de rastreio CTT.

### 2.5. Agradecimento e Avaliação (`order_completed`)
* **Gatilho:** 24h a 48h após a encomenda ser dada como concluída.
* **Assunto:** `Como foi a tua experiência com a Coisart? 💛`
* **Conteúdo:** Agradecimento caloroso e convite para avaliar a banca do artesão.

---

## 3. Matriz de E-mails para o Artesão / Vendedor

### 3.1. Notificação de Nova Venda (`vendor_new_sale`)
* **Gatilho:** Sempre que um cliente compra um ou mais artigos da banca do vendedor.
* **Assunto:** `Nova venda na tua banca! 🎉 — Coisart`
* **Conteúdo:** Lista de artigos vendidos, método de entrega selecionado e morada CTT do cliente (se aplicável).

### 3.2. Alerta de Reenvio Solicitado (`vendor_resend_alert`)
* **Gatilho:** Quando o Administrador assinala uma encomenda do vendedor como reenvio.
* **Assunto:** `Alerta: Reenvio solicitado para a encomenda #ID`
* **Conteúdo:** Instruções para preparação de uma nova unidade ou novo envio.

---

## 4. Arquitetura Técnica Recomendada para Implementação Futura

* **Provedor SMTP / API:** Resend (recomendado pela excelente integração com Node.js/React) ou SendGrid.
* **Motor de Templates:** React Email ou MJML para templates responsivos e elegantes.
