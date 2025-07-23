from rest_framework import serializers
import requests
from django.db import models
from .models import CustomUser, Material, Favorito, Comentario, Calificacion

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    recaptcha_token = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'password', 'recaptcha_token']

    def validate_recaptcha_token(self, value):
        from django.conf import settings
        recaptcha_secret = getattr(settings, 'RECAPTCHA_SECRET_KEY', None)
        if not recaptcha_secret:
            raise serializers.ValidationError("Captcha: Clave secreta no configurada.")
        url = 'https://www.google.com/recaptcha/api/siteverify'
        data = {'secret': recaptcha_secret, 'response': value}
        response = requests.post(url, data=data)
        result = response.json()

        if not result.get('success'):
            raise serializers.ValidationError("Captcha inválido. Intenta de nuevo.")
        return value

    def create(self, validated_data):
        validated_data.pop('recaptcha_token', None)
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class RecentMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'titulo', 'fecha_creacion', 'tipo']

class RecentComentarioSerializer(serializers.ModelSerializer):
    material_titulo = serializers.CharField(source='material.titulo')

    class Meta:
        model = Comentario
        fields = ['id', 'texto', 'fecha', 'material_titulo']

class RecentCalificacionSerializer(serializers.ModelSerializer):
    material_titulo = serializers.CharField(source='material.titulo')
    puntaje = serializers.IntegerField()

    class Meta:
        model = Calificacion
        fields = ['id', 'puntaje', 'fecha', 'material_titulo']

class UserProfileSerializer(serializers.ModelSerializer):
    statistics = serializers.SerializerMethodField()
    recent_activity = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'date_joined',
            'statistics', 'recent_activity'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'statistics', 'recent_activity']

    def get_statistics(self, obj):
        return {
            'materialsUploaded': obj.materiales.count(),
            'favorites': obj.favoritos.count(),
            'comments': Comentario.objects.filter(usuario=obj).count(),
            'ratings': Calificacion.objects.filter(usuario=obj).count(),
        }

    def get_recent_activity(self, obj):
        return {
            'materials': RecentMaterialSerializer(
                obj.materiales.all().order_by('-fecha_creacion')[:3], many=True
            ).data,
            'comments': RecentComentarioSerializer(
                Comentario.objects.filter(usuario=obj).order_by('-fecha')[:3], many=True
            ).data,
            'ratings': RecentCalificacionSerializer(
                Calificacion.objects.filter(usuario=obj).order_by('-fecha')[:3], many=True
            ).data,
        }

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6)


#---------------------------Material----------------------

from rest_framework import serializers
from .models import Material
import base64

class MaterialSerializer(serializers.ModelSerializer):
    # ARCHIVO PRINCIPAL
    archivo_blob = serializers.CharField(write_only=True, required=False, help_text="Archivo codificado en base64")
    archivo_nombre = serializers.CharField(required=False, allow_blank=True)
    archivo_tipo = serializers.CharField(required=False, allow_blank=True)
    archivo_url = serializers.SerializerMethodField(read_only=True)

    # MINIATURA (solo lectura, nunca la sube el usuario)
    thumbnail_url = serializers.SerializerMethodField(read_only=True)

    # USUARIO Y CALIFICACIONES
    usuario = serializers.ReadOnlyField(source='usuario.email')
    usuario_nombre = serializers.SerializerMethodField()
    calificacion_promedio = serializers.SerializerMethodField()
    total_calificaciones = serializers.SerializerMethodField()
    mi_calificacion = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'titulo', 'descripcion',
            'archivo_blob', 'archivo_nombre', 'archivo_tipo', 'archivo_url',
            'video_url', 'tipo',
            'usuario', 'usuario_nombre', 'fecha_creacion',
            'calificacion_promedio', 'total_calificaciones', 'mi_calificacion',
            'thumbnail_url',
        ]
        read_only_fields = [
            'id', 'usuario', 'usuario_nombre', 'fecha_creacion',
            'calificacion_promedio', 'total_calificaciones', 'mi_calificacion',
            'archivo_url', 'thumbnail_url'
        ]

    def validate(self, data):
        archivo_blob = data.get('archivo_blob', getattr(self.instance, 'archivo_blob', None))
        video_url = data.get('video_url', getattr(self.instance, 'video_url', None))
        if not archivo_blob and not video_url:
            raise serializers.ValidationError("Debes subir un archivo (como base64) o ingresar una URL de video.")
        return data


    def create(self, validated_data):
        archivo_blob_b64 = validated_data.pop('archivo_blob', None)
        if archivo_blob_b64:
            validated_data['archivo_blob'] = base64.b64decode(archivo_blob_b64)
        material = super().create(validated_data)
        # El thumbnail se genera automáticamente en la view (perform_create)
        return material

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Nunca devuelvas los blobs
        ret.pop('archivo_blob', None)
        return ret

    def get_archivo_url(self, obj):
        request = self.context.get('request')
        if obj.archivo_blob and request:
            return request.build_absolute_uri(f'/api/materiales/{obj.id}/descargar/')
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail_blob and request:
            return request.build_absolute_uri(f'/api/materiales/{obj.id}/thumbnail/')
        return None

    def get_calificacion_promedio(self, obj):
        calificaciones = getattr(obj, 'calificaciones', None)
        if calificaciones and calificaciones.exists():
            promedio = calificaciones.aggregate(models.Avg('puntaje'))['puntaje__avg']
            return round(promedio, 2)
        return None

    def get_total_calificaciones(self, obj):
        calificaciones = getattr(obj, 'calificaciones', None)
        return calificaciones.count() if calificaciones else 0

    def get_mi_calificacion(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            calificaciones = getattr(obj, 'calificaciones', None)
            calificacion = calificaciones.filter(usuario=request.user).first() if calificaciones else None
            if calificacion:
                return calificacion.puntaje
        return None

    def get_usuario_nombre(self, obj):
        if obj.usuario.first_name and obj.usuario.last_name:
            return f"{obj.usuario.first_name} {obj.usuario.last_name}"
        if obj.usuario.first_name:
            return obj.usuario.first_name
        return "Desconocido"


#-----------------------Favoritos--------------------------

class FavoritoSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.email')
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())

    class Meta:
        model = Favorito
        fields = ['id', 'usuario', 'material', 'fecha_agregado']
        read_only_fields = ['id', 'usuario', 'fecha_agregado']

    def validate(self, data):
        usuario = self.context['request'].user
        material = data['material']
        if Favorito.objects.filter(usuario=usuario, material=material).exists():
            raise serializers.ValidationError("Este material ya está en tus favoritos.")
        return data


#----------------------Comentario---------------------

class ComentarioSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.email')
    usuario_email = serializers.ReadOnlyField(source='usuario.email')
    nombre_usuario = serializers.SerializerMethodField()
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())

    class Meta:
        model = Comentario
        fields = ['id', 'usuario', 'usuario_email', 'nombre_usuario', 'material', 'texto', 'fecha']
        read_only_fields = ['id', 'usuario', 'usuario_email', 'nombre_usuario', 'fecha']

    def get_nombre_usuario(self, obj):
        nombre = obj.usuario.first_name or obj.usuario.email
        apellido = getattr(obj.usuario, "last_name", "")
        return f"{nombre} {apellido}".strip()


#---------------------------Calificacion---------------------------

class CalificacionSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.email')
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())

    class Meta:
        model = Calificacion
        fields = ['id', 'usuario', 'material', 'puntaje', 'fecha']
        read_only_fields = ['id', 'usuario', 'fecha']

    def validate_puntaje(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("El puntaje debe estar entre 1 y 5.")
        return value