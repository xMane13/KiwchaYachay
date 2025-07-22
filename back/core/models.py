from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import FileExtensionValidator
from django.db import models
from django.conf import settings


#------------------------------Usurario-------------------------------------------------

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    

#-------------------------------------------Materiales---------------------------------

from django.db import models
from django.conf import settings

TIPO_CHOICES = [
    ('ficha', 'Ficha'),
    ('presentacion', 'Presentación'),
    ('video', 'Video'),
]

class Material(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    archivo_blob = models.BinaryField(blank=True, null=True)
    archivo_nombre = models.CharField(max_length=255, blank=True, null=True)
    archivo_tipo = models.CharField(max_length=100, blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='materiales')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    # Miniatura
    thumbnail_blob = models.BinaryField(blank=True, null=True)
    thumbnail_tipo = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f'{self.titulo} ({self.tipo})'


#----------------------------Favoritos------------------------------

class Favorito(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favoritos')
    material = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='favoritos')
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'material') 

    def __str__(self):
        return f"{self.usuario} - {self.material.titulo}"
    
#------------------------Comentarios--------------------

class Comentario(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='comentarios')
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.email} - {self.texto[:40]}..."
    

#-------------------------Calificacion------------------------

class Calificacion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey('Material', on_delete=models.CASCADE, related_name='calificaciones')
    puntaje = models.PositiveSmallIntegerField()
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'material')

    def __str__(self):
        return f"{self.usuario.email} - {self.material.titulo} - {self.puntaje} estrellas"

