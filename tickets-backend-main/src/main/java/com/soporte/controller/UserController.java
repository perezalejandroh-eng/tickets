package com.soporte.controller;

import com.soporte.dto.request.ChangePasswordRequest;
import com.soporte.dto.request.PasswordResetRequest;
import com.soporte.dto.request.UserUpdateRequest;
import com.soporte.dto.response.ApiResponse;
import com.soporte.dto.response.UserResponse;
import com.soporte.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    // ── Listado admin ─────────────────────────────────────────────────────

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listarUsuarios(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listarUsuario(pageable)));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<UserResponse.RoleResponse>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getRoles()));
    }

    // ── Perfil propio (cualquier usuario autenticado) ─────────────────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> obtenerPerfil() {
        return ResponseEntity.ok(ApiResponse.ok(userService.obtenerPerfil()));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> cambiarPasswordPerfil(
            @RequestBody @Valid ChangePasswordRequest req) {
        userService.cambiarPasswordPerfil(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── Acciones de estatus (admin) ───────────────────────────────────────

    @PatchMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<UserResponse>> aprobarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.aprobarUsuario(id)));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<UserResponse>> activarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.activarUsuario(id)));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<UserResponse>> desactivarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.desactivarUsuario(id)));
    }

    // ── Edición completa (admin) ──────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<UserResponse>> actualizarUsuario(
            @PathVariable Long id, @RequestBody @Valid UserUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(userService.actualizarUsuario(id, req)));
    }

    @PatchMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> resetearPassword(
            @PathVariable Long id, @RequestBody @Valid PasswordResetRequest req) {
        userService.resetearPasswordAdmin(id, req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
