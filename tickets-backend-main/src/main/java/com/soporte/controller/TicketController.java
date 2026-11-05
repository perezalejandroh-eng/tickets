package com.soporte.controller;

import com.soporte.dto.request.CambioEstatusRequest;
import com.soporte.dto.request.ComentarioRequest;
import com.soporte.dto.request.TicketCreateRequest;
import com.soporte.dto.response.ApiResponse;
import com.soporte.dto.response.TicketResponse;
import com.soporte.entity.Usuario;
import com.soporte.service.AuthService;
import com.soporte.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TicketResponse>> crear(
            @Valid @RequestPart("ticket") TicketCreateRequest req,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos) {
        Usuario usuario = authService.getUsuarioActual();
        TicketResponse response = ticketService.crearTicket(req, usuario, archivos);
        return ResponseEntity.ok(ApiResponse.ok("Ticket creado exitosamente.", response));
    }

    @GetMapping("/mis-tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> misTickets(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.listarTicketsUsuario(usuario, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> detalle(@PathVariable Long id) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.obtenerDetalle(id, usuario)));
    }

    @PatchMapping("/{id}/estatus")
    @PreAuthorize("hasAnyRole('AGENTE','SUPERVISOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<TicketResponse>> cambiarEstatus(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstatusRequest req) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.cambiarEstatus(id, req, usuario)));
    }

    @PatchMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('AGENTE','SUPERVISOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<TicketResponse>> asignar(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Long> body) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.asignarTicket(id, body.get("agenteId"), usuario)));
    }

    @PostMapping(value = "/{id}/comentarios", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TicketResponse.ComentarioResponse>> comentar(
            @PathVariable Long id,
            @Valid @RequestPart("comentario") ComentarioRequest req,
            @RequestPart(value = "archivos", required = false) List<MultipartFile> archivos) {
        Usuario usuario = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.agregarComentario(id, req, usuario, archivos)));
    }
}
