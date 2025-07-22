from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, ProfileView, VerifyEmailView, PasswordResetRequestView, PasswordResetConfirmView, MaterialListCreateView, MaterialDetailView, FavoritoViewSet, ComentarioViewSet, CalificacionViewSet, MaterialDownloadView, MaterialThumbnailView
from rest_framework_simplejwt.views import (
    TokenRefreshView, TokenBlacklistView
)


router = DefaultRouter()
router.register(r'favoritos', FavoritoViewSet, basename='favorito')
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'calificaciones', CalificacionViewSet, basename='calificacion')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('reset-password/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('materiales/', MaterialListCreateView.as_view(), name='material-list-create'),
    path('materiales/<int:pk>/', MaterialDetailView.as_view(), name='material-detail'),
    path('materiales/<int:pk>/descargar/', MaterialDownloadView.as_view(), name='material-download'),
    path('materiales/<int:pk>/thumbnail/', MaterialThumbnailView.as_view(), name='material-thumbnail'),
]

urlpatterns += router.urls

