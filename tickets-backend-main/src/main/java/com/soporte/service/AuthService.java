package com.soporte.service;

import com.soporte.dto.request.LoginRequest;
import com.soporte.dto.request.RegisterRequest;
import com.soporte.dto.response.JwtResponse;
import com.soporte.entity.*;
import com.soporte.exception.BusinessException;
import com.soporte.repository.*;
import com.soporte.security.JwtTokenProvider;
import com.soporte.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final DependenciaRepository dependenciaRepository;
    private final EdificioRepository edificioRepository;
    private final PisoRepository pisoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findById(userPrincipal.getId()).orElseThrow();

        if (!usuario.getActivo()) {
            log.warn("LOGIN_BLOQUEADO - cuenta inactiva | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
            throw new BusinessException("La cuenta está desactivada");
        }
        if (!usuario.getCorreoVerificado()) {
            log.warn("LOGIN_BLOQUEADO - correo no verificado | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
            throw new BusinessException("Por favor verifica tu correo antes de iniciar sesión");
        }

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(usuario.getId());

        log.info("LOGIN_OK | id: {} | correo: {} | rol: {}", usuario.getId(), usuario.getCorreo(), usuario.getRol().getNombre());

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(usuario.getId())
                .nombre(usuario.getNombreCompleto())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol().getNombre())
                .build();
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            log.warn("REGISTRO_RECHAZADO - correo duplicado | correo: {}", request.getCorreo());
            throw new BusinessException("El correo ya está registrado");
        }

        Role rol = roleRepository.findByNombre("USUARIO")
                .orElseThrow(() -> new BusinessException("Rol por defecto no encontrado"));

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .correo(request.getCorreo())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .telefono(request.getTelefono())
                .extension(request.getExtension())
                .area(request.getArea())
                .rol(rol)
                .activo(true)
                .correoVerificado(false)
                .tokenVerificacion(UUID.randomUUID().toString())
                .build();

        if (request.getDependenciaId() != null) {
            usuario.setDependencia(dependenciaRepository.findById(request.getDependenciaId()).orElse(null));
        }
        if (request.getEdificioId() != null) {
            usuario.setEdificio(edificioRepository.findById(request.getEdificioId()).orElse(null));
        }
        if (request.getPisoId() != null) {
            usuario.setPiso(pisoRepository.findById(request.getPisoId()).orElse(null));
        }

        usuarioRepository.save(usuario);
        log.info("REGISTRO_OK | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
        emailService.enviarVerificacion(usuario);
    }

    @Transactional
    public void verificarCorreo(String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacion(token)
                .orElseThrow(() -> new BusinessException("Token de verificación inválido"));
        usuario.setCorreoVerificado(true);
        usuario.setTokenVerificacion(null);
        usuarioRepository.save(usuario);
        log.info("EMAIL_VERIFICADO | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
    }

    @Transactional
    public void solicitarRecuperacion(String correo) {
        usuarioRepository.findByCorreo(correo).ifPresent(usuario -> {
            usuario.setTokenRecuperacion(UUID.randomUUID().toString());
            usuario.setTokenRecuperacionExpira(LocalDateTime.now().plusHours(2));
            usuarioRepository.save(usuario);
            log.info("RECUPERACION_SOLICITADA | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
            emailService.enviarRecuperacion(usuario);
        });
    }

    @Transactional
    public void resetPassword(String token, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token)
                .orElseThrow(() -> new BusinessException("Token de recuperación inválido"));

        if (usuario.getTokenRecuperacionExpira().isBefore(LocalDateTime.now())) {
            log.warn("RESET_PASSWORD_EXPIRADO | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
            throw new BusinessException("El token de recuperación ha expirado");
        }

        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuario.setTokenRecuperacion(null);
        usuario.setTokenRecuperacionExpira(null);
        usuarioRepository.save(usuario);
        log.info("PASSWORD_RESETEADO | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
    }

    public Usuario getUsuarioActual() {
        UserPrincipal principal = (UserPrincipal)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    }
}
