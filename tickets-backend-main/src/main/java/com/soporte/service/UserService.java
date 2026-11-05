package com.soporte.service;

import com.soporte.dto.request.ChangePasswordRequest;
import com.soporte.dto.request.PasswordResetRequest;
import com.soporte.dto.request.UserUpdateRequest;
import com.soporte.dto.response.UserResponse;
import com.soporte.entity.Dependencia;
import com.soporte.entity.Edificio;
import com.soporte.entity.Piso;
import com.soporte.entity.Role;
import com.soporte.entity.Usuario;
import com.soporte.exception.BusinessException;
import com.soporte.exception.ResourceNotFoundException;
import com.soporte.repository.DependenciaRepository;
import com.soporte.repository.EdificioRepository;
import com.soporte.repository.PisoRepository;
import com.soporte.repository.RoleRepository;
import com.soporte.repository.UsuarioRepository;
import com.soporte.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final DependenciaRepository dependenciaRepository;
    private final EdificioRepository edificioRepository;
    private final PisoRepository pisoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> listarUsuario(Pageable pageable) {
        log.debug("LISTAR_USUARIOS | página: {} | tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());
        return usuarioRepository.findAll(pageable).map(this::buildUserResponse);
    }

    @Transactional
    public UserResponse aprobarUsuario(Long id) {
        Long adminId = getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (Boolean.TRUE.equals(usuario.getActivo()) && Boolean.TRUE.equals(usuario.getCorreoVerificado())) {
            log.warn("APROBAR_USUARIO_RECHAZADO - ya activo | id: {} | correo: {} | admin: {}",
                    usuario.getId(), usuario.getCorreo(), adminId);
            throw new BusinessException("El usuario ya se encuentra activo");
        }

        usuario.setActivo(true);
        usuario.setCorreoVerificado(true);
        usuario.setTokenVerificacion(null);
        UserResponse response = buildUserResponse(usuarioRepository.save(usuario));
        log.info("USUARIO_APROBADO | id: {} | correo: {} | por admin: {}", usuario.getId(), usuario.getCorreo(), adminId);
        return response;
    }

    @Transactional
    public UserResponse activarUsuario(Long id) {
        Long adminId = getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (Boolean.TRUE.equals(usuario.getActivo())) {
            log.warn("ACTIVAR_USUARIO_RECHAZADO - ya activo | id: {} | correo: {} | admin: {}",
                    usuario.getId(), usuario.getCorreo(), adminId);
            throw new BusinessException("El usuario ya se encuentra activo");
        }

        usuario.setActivo(true);
        UserResponse response = buildUserResponse(usuarioRepository.save(usuario));
        log.info("USUARIO_ACTIVADO | id: {} | correo: {} | por admin: {}", usuario.getId(), usuario.getCorreo(), adminId);
        return response;
    }

    @Transactional
    public UserResponse desactivarUsuario(Long id) {
        Long adminId = getCurrentUserId();
        if (id.equals(adminId)) {
            log.warn("DESACTIVAR_USUARIO_RECHAZADO - auto-desactivacion | admin: {}", adminId);
            throw new BusinessException("No puedes desactivar tu propia cuenta");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            log.warn("DESACTIVAR_USUARIO_RECHAZADO - ya inactivo | id: {} | correo: {} | admin: {}",
                    usuario.getId(), usuario.getCorreo(), adminId);
            throw new BusinessException("El usuario ya se encuentra inactivo");
        }

        usuario.setActivo(false);
        UserResponse response = buildUserResponse(usuarioRepository.save(usuario));
        log.info("USUARIO_DESACTIVADO | id: {} | correo: {} | por admin: {}", usuario.getId(), usuario.getCorreo(), adminId);
        return response;
    }

    // ── Perfil del usuario autenticado ────────────────────────────────────

    @Transactional(readOnly = true)
    public UserResponse obtenerPerfil() {
        Long userId = getCurrentUserId();
        return buildUserResponse(
                usuarioRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado")));
    }

    @Transactional
    public void cambiarPasswordPerfil(ChangePasswordRequest req) {
        Long userId = getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(req.getPasswordActual(), usuario.getPasswordHash())) {
            log.warn("CAMBIO_PASSWORD_RECHAZADO - contraseña incorrecta | id: {}", userId);
            throw new BusinessException("La contraseña actual es incorrecta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(req.getPasswordNuevo()));
        usuarioRepository.save(usuario);
        log.info("PASSWORD_CAMBIADO_PERFIL | id: {} | correo: {}", usuario.getId(), usuario.getCorreo());
    }

    // ── Admin: actualizar usuario ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse.RoleResponse> getRoles() {
        return roleRepository.findAllByActivoTrue().stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse actualizarUsuario(Long id, UserUpdateRequest req) {
        Long adminId = getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        String correo = req.getCorreo().trim().toLowerCase();
        if (!usuario.getCorreo().equalsIgnoreCase(correo) &&
                usuarioRepository.existsByCorreoAndIdNot(correo, id)) {
            log.warn("ACTUALIZAR_USUARIO_RECHAZADO - correo duplicado | id: {} | correo: {}", id, correo);
            throw new BusinessException("El correo ya está en uso por otro usuario");
        }

        Role rol = roleRepository.findById(req.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + req.getRolId()));

        usuario.setNombre(req.getNombre().trim());
        usuario.setApellidoPaterno(req.getApellidoPaterno().trim());
        usuario.setApellidoMaterno(req.getApellidoMaterno());
        usuario.setCorreo(correo);
        usuario.setTelefono(req.getTelefono());
        usuario.setExtension(req.getExtension());
        usuario.setArea(req.getArea());
        usuario.setRol(rol);
        usuario.setDependencia(req.getDependenciaId() != null
                ? dependenciaRepository.findById(req.getDependenciaId()).orElse(null) : null);
        usuario.setEdificio(req.getEdificioId() != null
                ? edificioRepository.findById(req.getEdificioId()).orElse(null) : null);
        usuario.setPiso(req.getPisoId() != null
                ? pisoRepository.findById(req.getPisoId()).orElse(null) : null);

        UserResponse response = buildUserResponse(usuarioRepository.save(usuario));
        log.info("USUARIO_ACTUALIZADO | id: {} | correo: {} | por admin: {}", id, correo, adminId);
        return response;
    }

    @Transactional
    public void resetearPasswordAdmin(Long id, PasswordResetRequest req) {
        Long adminId = getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        usuarioRepository.save(usuario);
        log.info("PASSWORD_RESETEADO_ADMIN | id: {} | correo: {} | por admin: {}", id, usuario.getCorreo(), adminId);
    }

    private Long getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }

    private String calcularEstatus(Usuario usuario) {
        if (!Boolean.TRUE.equals(usuario.getActivo())) return "INACTIVO";
        if (!Boolean.TRUE.equals(usuario.getCorreoVerificado())) return "PENDIENTE";
        return "ACTIVO";
    }

    private UserResponse buildUserResponse(Usuario usuario) {
        return UserResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellidoPaterno(usuario.getApellidoPaterno())
                .apellidoMaterno(usuario.getApellidoMaterno())
                .correo(usuario.getCorreo())
                .telefono(usuario.getTelefono())
                .extension(usuario.getExtension())
                .area(usuario.getArea())
                .dependencia(usuario.getDependencia() != null ? toDependenciaResponse(usuario.getDependencia()) : null)
                .edificio(usuario.getEdificio() != null ? toEdificioResponse(usuario.getEdificio()) : null)
                .piso(usuario.getPiso() != null ? toPisoResponse(usuario.getPiso()) : null)
                .rol(toRoleResponse(usuario.getRol()))
                .activo(usuario.getActivo())
                .correoVerificado(usuario.getCorreoVerificado())
                .estatus(calcularEstatus(usuario))
                .createdAt(usuario.getCreatedAt())
                .updatedAt(usuario.getUpdatedAt())
                .build();
    }

    private UserResponse.DependenciaResponse toDependenciaResponse(Dependencia dependencia) {
        return UserResponse.DependenciaResponse.builder()
                .id(dependencia.getId())
                .nombre(dependencia.getNombre())
                .descripcion(dependencia.getDescripcion())
                .activo(dependencia.getActivo())
                .createdAt(dependencia.getCreatedAt())
                .updatedAt(dependencia.getUpdatedAt())
                .build();
    }

    private UserResponse.EdificioResponse toEdificioResponse(Edificio edificio) {
        return UserResponse.EdificioResponse.builder()
                .id(edificio.getId())
                .nombre(edificio.getNombre())
                .direccion(edificio.getDireccion())
                .descripcion(edificio.getDescripcion())
                .activo(edificio.getActivo())
                .createdAt(edificio.getCreatedAt())
                .updatedAt(edificio.getUpdatedAt())
                .build();
    }

    private UserResponse.PisoResponse toPisoResponse(Piso piso) {
        return UserResponse.PisoResponse.builder()
                .id(piso.getId())
                .nombre(piso.getNombre())
                .numero(piso.getNumero())
                .descripcion(piso.getDescripcion())
                .edificio(piso.getEdificio() != null ? toEdificioResponse(piso.getEdificio()) : null)
                .activo(piso.getActivo())
                .createdAt(piso.getCreatedAt())
                .updatedAt(piso.getUpdatedAt())
                .build();
    }

    private UserResponse.RoleResponse toRoleResponse(Role rol) {
        return UserResponse.RoleResponse.builder()
                .id(rol.getId())
                .nombre(rol.getNombre())
                .descripcion(rol.getDescripcion())
                .activo(rol.getActivo())
                .createdAt(rol.getCreatedAt())
                .updatedAt(rol.getUpdatedAt())
                .build();
    }
}
