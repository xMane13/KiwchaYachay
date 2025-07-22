from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Material
from pdf2image import convert_from_bytes
from io import BytesIO

@receiver(post_save, sender=Material)
def generate_pdf_thumbnail(sender, instance, created, **kwargs):
    # Solo para PDFs subidos, con blob, y si no hay thumbnail aún
    if (
        created and
        instance.archivo_blob and
        instance.archivo_tipo and
        instance.archivo_tipo.lower() == 'application/pdf' and
        not instance.thumbnail_blob
    ):
        try:
            # Usar convert_from_bytes de pdf2image
            images = convert_from_bytes(
                instance.archivo_blob,
                first_page=1,
                last_page=1,
                fmt='jpeg',
                size=(400, 500)
            )
            if images:
                thumb_io = BytesIO()
                images[0].save(thumb_io, format='JPEG')
                # Guardar miniatura en el campo BLOB y tipo en thumbnail_tipo
                instance.thumbnail_blob = thumb_io.getvalue()
                instance.thumbnail_tipo = "image/jpeg"
                instance.save(update_fields=['thumbnail_blob', 'thumbnail_tipo'])
        except Exception as e:
            print("Error generating thumbnail:", e)
