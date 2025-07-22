import os
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

# Dominios para los links
BACKEND_DOMAIN = os.environ.get('BACKEND_DOMAIN', 'http://127.0.0.1:8000')
FRONTEND_DOMAIN = os.environ.get('FRONTEND_DOMAIN', 'http://localhost:5173')

def send_verification_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    # Cambia: ahora va al frontend, no a DRF
    verify_url = f"{FRONTEND_DOMAIN}/verify-email/{uid}/{token}/"

    subject = 'Verifica tu cuenta en Kichwa Yachay'
    text_content = f"Hola {user.first_name or user.email},\n\nVerifica tu cuenta haciendo clic en este enlace:\n{verify_url}"

    html_content = f"""
    <html>
      <body style="font-family:sans-serif; background:#f9f9f9; padding:0;">
        <div style="max-width:500px;margin:30px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 2px 12px #eee;">
          <h2 style="color:#6633cc;">¡Bienvenido a Kichwa Yachay!</h2>
          <p>Hola <b>{user.first_name or user.email}</b>,</p>
          <p>Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente botón:</p>
          <a href="{verify_url}" style="display:inline-block; background:#6633cc; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; margin-top:16px;">Verificar mi cuenta</a>
          <p style="color:#888; margin-top:24px;">O copia y pega este enlace en tu navegador:</p>
          <code style="background:#f4f4f4; color:#555; padding:5px 8px; border-radius:5px; display:block; margin-bottom: 20px;">{verify_url}</code>
          <p style="margin-top:24px; color:#aaa; font-size:12px;">Si tú no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
        </div>
      </body>
    </html>
    """

    msg = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [user.email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def send_password_reset_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # También puedes redirigir al frontend
    reset_url = f"{FRONTEND_DOMAIN}/reset-password/{uid}/{token}/"

    subject = 'Recupera tu contraseña en Kichwa Yachay'
    text_content = f"Hola {user.first_name or user.email},\n\nRestablece tu contraseña haciendo clic en este enlace:\n{reset_url}"

    html_content = f"""
    <html>
      <body style="font-family:sans-serif; background:#f9f9f9; padding:0;">
        <div style="max-width:500px;margin:30px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 2px 12px #eee;">
          <h2 style="color:#6633cc;">Restablece tu contraseña</h2>
          <p>Hola <b>{user.first_name or user.email}</b>,</p>
          <p>Puedes restablecer tu contraseña haciendo clic en el botón:</p>
          <a href="{reset_url}" style="display:inline-block; background:#6633cc; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; margin-top:16px;">Restablecer contraseña</a>
          <p style="color:#888; margin-top:24px;">O copia y pega este enlace en tu navegador:</p>
          <code style="background:#f4f4f4; color:#555; padding:5px 8px; border-radius:5px; display:block; margin-bottom: 20px;">{reset_url}</code>
          <p style="margin-top:24px; color:#aaa; font-size:12px;">Si tú no solicitaste esto, puedes ignorar este mensaje.</p>
        </div>
      </body>
    </html>
    """

    msg = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [user.email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()
