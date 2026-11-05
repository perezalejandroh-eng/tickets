package com.soporte.controller;

import com.soporte.dto.response.ApiResponse;
import com.soporte.entity.Notificacion;
import com.soporte.entity.Usuario;
import com.soporte.service.AuthService;
import com.soporte.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notificacion>>> listar(
            @PageableDefault(size = 20) Pageable pageable) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(notificacionService.obtenerNotificaciones(usuario, pageable)));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<ApiResponse<List<Notificacion>>> noLeidas() {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(notificacionService.obtenerNoLeidas(usuario)));
    }

    @GetMapping("/contador")
    public ResponseEntity<ApiResponse<Map<String, Long>>> contador() {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("noLeidas", notificacionService.contarNoLeidas(usuario))));
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<ApiResponse<Void>> marcarLeida(@PathVariable Long id) {
        Usuario usuario = authService.getUsuarioActual();
        notificacionService.marcarLeida(id, usuario);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<ApiResponse<Void>> marcarTodasLeidas() {
        Usuario usuario = authService.getUsuarioActual();
        notificacionService.marcarTodasLeidas(usuario);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
