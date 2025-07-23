from rest_framework import generics, permissions, status, parsers, viewsets, filters
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from .models import CustomUser, Material, Favorito, Comentario, Calificacion
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UserProfileSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, MaterialSerializer, FavoritoSerializer, ComentarioSerializer, CalificacionSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from .utils import send_verification_email, send_password_reset_email
from .permissions import IsOwnerOrReadOnly, EsAutorComentario
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from django.http import HttpResponse, Http404
from rest_framework.parsers import JSONParser
from PIL import Image
import io
import base64

try:
    from pdf2image import convert_from_bytes
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

User = get_user_model()

#Registro con envio de correo
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_verification_email(user, self.request)

# Login usando JWT
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            if not user.is_verified:
                return Response({'error': 'Cuenta no verificada. Revisa tu email.'}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)
    
#Vista del Perfil de Usuario
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

#Verificacion email
class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        if user and default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({'message': '¡Cuenta verificada correctamente!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Link inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)


#Recuperacion de contrasenia
class PasswordResetRequestView(generics.GenericAPIView):
    # Recibe solo el email, y manda el correo de recuperación
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Debes proporcionar un email."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"msg": "Si el email existe, recibirás instrucciones para restablecer tu contraseña."})
        
        send_password_reset_email(user, request)
        return Response({"msg": "Si el email existe, recibirás instrucciones para restablecer tu contraseña."})

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        new_password = serializer.validated_data['password']

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Enlace inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"msg": "Contraseña actualizada correctamente."})


#------------------------------Material----------------------------
class MaterialListCreateView(generics.ListCreateAPIView):
    queryset = Material.objects.all().order_by('-fecha_creacion')
    serializer_class = MaterialSerializer
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'titulo': ['exact', 'icontains'],
        'tipo': ['exact'],
        'usuario': ['exact'],
        'fecha_creacion': ['exact', 'gte', 'lte'],
    }
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['fecha_creacion', 'titulo']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Material.objects.filter(usuario=user).order_by('-fecha_creacion')
        return Material.objects.all().order_by('-fecha_creacion')

    def perform_create(self, serializer):
        # Decodifica el archivo principal
        archivo_blob_b64 = self.request.data.get('archivo_blob')
        archivo_tipo = self.request.data.get('archivo_tipo')

        thumbnail_blob = None
        thumbnail_tipo = None

        # Solo para 'ficha' o 'presentacion' generamos thumbnail
        if archivo_blob_b64 and archivo_tipo:
            try:
                decoded = base64.b64decode(archivo_blob_b64)
                # Si es imagen
                if archivo_tipo.startswith("image/"):
                    thumb = Image.open(io.BytesIO(decoded))
                    thumb.thumbnail((400, 400))
                    output = io.BytesIO()
                    thumb.save(output, format='PNG')
                    thumbnail_blob = output.getvalue()
                    thumbnail_tipo = 'image/png'
                # Si es PDF y tienes pdf2image
                elif archivo_tipo == "application/pdf" and PDF_SUPPORT:
                    images = convert_from_bytes(decoded, first_page=1, last_page=1, size=(400, 400))
                    output = io.BytesIO()
                    images[0].save(output, format='PNG')
                    thumbnail_blob = output.getvalue()
                    thumbnail_tipo = 'image/png'
                # Puedes agregar más tipos si lo deseas
            except Exception as e:
                print("No se pudo generar thumbnail automáticamente:", e)

        serializer.save(
            usuario=self.request.user,
            thumbnail_blob=thumbnail_blob,
            thumbnail_tipo=thumbnail_tipo,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_update(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MaterialDownloadView(APIView):
    def get(self, request, pk):
        try:
            material = Material.objects.get(pk=pk)
        except Material.DoesNotExist:
            raise Http404("Material no encontrado.")

        if not material.archivo_blob:
            return Response({"error": "Este material no tiene archivo adjunto."}, status=404)

        content_type = material.archivo_tipo or "application/octet-stream"
        nombre = material.archivo_nombre or f"material_{material.pk}"

        response = HttpResponse(material.archivo_blob, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{nombre}"'
        return response


class MaterialThumbnailView(APIView):
    def get(self, request, pk):
        try:
            material = Material.objects.get(pk=pk)
        except Material.DoesNotExist:
            raise Http404("Material no encontrado.")

        if not material.thumbnail_blob:
            return Response({"error": "Este material no tiene miniatura."}, status=404)

        content_type = material.thumbnail_tipo or "image/png"
        nombre = f"thumbnail_{material.pk}.png"

        response = HttpResponse(material.thumbnail_blob, content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{nombre}"'
        return response
#-----------------------FAvorito-----------------------------
class FavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Así solo puedes ver tus propios favoritos
        return Favorito.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

#------------------------Comentarios----------------------------

class ComentarioViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, EsAutorComentario]

    def get_queryset(self):
        material_id = self.request.query_params.get('material')
        qs = Comentario.objects.all().order_by('-fecha')
        if material_id:
            qs = qs.filter(material_id=material_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


#----------------------Calificacion-------------------------
class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Calificacion.objects.all()

    def get_queryset(self):
        material_id = self.request.query_params.get('material')
        qs = Calificacion.objects.all().order_by('-fecha')
        if material_id:
            qs = qs.filter(material_id=material_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)