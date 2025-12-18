// Supabase Edge Function: notify-onboarding
// Deploy this function to Supabase Edge Functions

// To deploy:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref YOUR_PROJECT_REF
// 4. Deploy: supabase functions deploy notify-onboarding

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingRecord {
    id: string
    created_at: string
    tone_of_voice: string
    whatsapp_notificacao: string
    email_agenda: string
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const record = payload.record as OnboardingRecord

        // Recipients
        const recipients = [
            'victorlllima@gmail.com',
            'netolimapereira2015@gmail.com'
        ]

        // Send email using Resend (recommended for Supabase)
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Onboarding System <onboarding@seu-dominio.com>',
                to: recipients,
                subject: '🔔 Novo preenchimento de onboarding recebido',
                html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">Novo Onboarding Recebido!</h1>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
              <h2 style="color: #1a1a25; font-size: 18px; margin-top: 0;">Resumo do Registro</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">ID:</td>
                  <td style="padding: 8px 0; color: #1a1a25; font-family: monospace;">${record.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Data:</td>
                  <td style="padding: 8px 0; color: #1a1a25;">${new Date(record.created_at).toLocaleString('pt-BR')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tom de Voz:</td>
                  <td style="padding: 8px 0; color: #1a1a25;">${record.tone_of_voice || 'Não definido'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">WhatsApp:</td>
                  <td style="padding: 8px 0; color: #1a1a25;">${formatPhone(record.whatsapp_notificacao)}</td>
                </tr>
                ${record.email_agenda ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">E-mail Agenda:</td>
                  <td style="padding: 8px 0; color: #1a1a25;">${record.email_agenda}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://seu-dominio.com/dashboard.html" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                        color: white; padding: 14px 28px; border-radius: 28px; 
                        text-decoration: none; font-weight: 600;">
                Acessar Dashboard
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Esta é uma notificação automática do sistema de onboarding.
            </p>
          </div>
        `,
            }),
        })

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text()
            console.error('Email send error:', errorData)
            throw new Error(`Failed to send email: ${errorData}`)
        }

        const result = await emailResponse.json()
        console.log('Email sent successfully:', result)

        return new Response(
            JSON.stringify({ success: true, message: 'Notification sent', result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

function formatPhone(phone: string): string {
    if (!phone) return '-'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
}
