<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Recibo de Pago #{{ $payment->id }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.5;
    }
    .no-print { display: block; text-align: center; margin: 20px 0; }
    .no-print button {
      background: #1a3a5c;
      color: #fff;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
    }
    .no-print button:hover { background: #2a4a6c; }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 50px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1a3a5c;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header .institution h1 {
      font-size: 20px;
      color: #1a3a5c;
      margin-bottom: 4px;
    }
    .header .institution p {
      font-size: 12px;
      color: #666;
    }
    .header .receipt-number {
      text-align: right;
    }
    .header .receipt-number h2 {
      font-size: 18px;
      color: #1a3a5c;
    }
    .header .receipt-number p {
      font-size: 12px;
      color: #666;
    }
    .title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      color: #1a3a5c;
      margin-bottom: 28px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 20px;
    }
    .section h3 {
      font-size: 13px;
      color: #1a3a5c;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }
    .info-grid .field {
      display: flex;
      gap: 6px;
    }
    .info-grid .label {
      font-weight: 600;
      color: #555;
      min-width: 110px;
      font-size: 13px;
    }
    .info-grid .value {
      color: #1a1a1a;
      font-size: 13px;
    }
    .info-grid.full { grid-template-columns: 1fr; }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .details-table th {
      text-align: left;
      font-size: 12px;
      color: #555;
      text-transform: uppercase;
      border-bottom: 1px solid #ddd;
      padding: 6px 8px;
      font-weight: 600;
    }
    .details-table td {
      padding: 8px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
    }
    .details-table td:last-child,
    .details-table th:last-child { text-align: right; }
    .details-table td.amount {
      font-weight: bold;
      font-size: 15px;
    }
    .total-row td {
      font-weight: bold;
      font-size: 15px;
      border-top: 2px solid #1a3a5c;
      padding-top: 8px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }
    .stripe-ref {
      font-size: 11px;
      color: #999;
      text-align: center;
      margin-top: 8px;
    }
    @media print {
      .no-print { display: none !important; }
      body { font-size: 12px; }
      .receipt { padding: 20px 30px; }
      .header .institution h1 { font-size: 17px; }
      .title { font-size: 18px; margin-bottom: 20px; }
      .info-grid .label { font-size: 11px; }
      .info-grid .value { font-size: 11px; }
      .details-table th { font-size: 10px; }
      .details-table td { font-size: 11px; }
      .details-table td.amount { font-size: 13px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">Imprimir Recibo</button>
    <button onclick="window.close()" style="background:#666;margin-left:8px;">Cerrar</button>
  </div>

  <div class="receipt">
    <div class="header">
      <div class="institution">
        <h1>Facultad Integral del Chaco</h1>
        <p>Sistema de Gestión de Tesis</p>
      </div>
      <div class="receipt-number">
        <h2>REC-{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</h2>
        <p>{{ $payment->paid_at?->format('d/m/Y') ?? $payment->created_at->format('d/m/Y') }}</p>
      </div>
    </div>

    <div class="title">Recibo de Pago</div>

    <div class="section">
      <h3>Datos del Estudiante</h3>
      <div class="info-grid">
        <div class="field">
          <span class="label">Nombre:</span>
          <span class="value">{{ $user->full_name }}</span>
        </div>
        <div class="field">
          <span class="label">CI:</span>
          <span class="value">{{ $user->ci }}</span>
        </div>
        <div class="field">
          <span class="label">Registro:</span>
          <span class="value">{{ $user->registration_number }}</span>
        </div>
        <div class="field">
          <span class="label">Email:</span>
          <span class="value">{{ $user->email }}</span>
        </div>
      </div>
    </div>

    @if ($thesis)
    <div class="section">
      <h3>Datos de la Tesis</h3>
      <div class="info-grid full">
        <div class="field">
          <span class="label">Título:</span>
          <span class="value">{{ $thesis->title }}</span>
        </div>
        @if ($thesis->career)
        <div class="field">
          <span class="label">Carrera:</span>
          <span class="value">{{ $thesis->career->name }}</span>
        </div>
        @endif
      </div>
    </div>
    @endif

    <div class="section">
      <h3>Detalle del Pago</h3>
      <table class="details-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Tipo</th>
            <th>Cuota</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $payment->concept ?? 'Defensa de Tesis' }}</td>
            <td>{{ $payment->payment_type === 'credito' ? 'Crédito' : 'Contado' }}</td>
            <td>
              @if ($payment->total_installments > 1)
                {{ $payment->installment_number ?? 1 }}/{{ $payment->total_installments }}
              @else
                —
              @endif
            </td>
            <td class="amount">{{ number_format($payment->amount / 100, 2) }} Bs.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" style="text-align:right;padding-right:8px;">Total:</td>
            <td class="amount">{{ number_format($payment->amount / 100, 2) }} Bs.</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="section" style="margin-top:24px;">
      <div style="display:flex;justify-content:space-between;padding-top:8px;">
        <div style="text-align:center;flex:1;">
          <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:6px;font-size:12px;color:#555;">
            Firma del Estudiante
          </div>
        </div>
        <div style="text-align:center;flex:1;">
          <div style="border-top:1px solid #333;width:200px;margin:0 auto;padding-top:6px;font-size:12px;color:#555;">
            Sello de Secretaría
          </div>
        </div>
      </div>
    </div>

    <div class="stripe-ref">
      ID Transacción: {{ $payment->stripe_payment_intent_id }} &mdash; Estado: Pagado
    </div>

    <div class="footer">
      Documento generado el {{ now()->format('d/m/Y H:i') }} &mdash; Sistema de Gestión de Tesis
    </div>
  </div>
</body>
</html>
