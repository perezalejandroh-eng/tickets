package com.soporte.controller;

import com.soporte.dto.response.ApiResponse;
import com.soporte.dto.response.TicketResponse;
import com.soporte.entity.Usuario;
import com.soporte.repository.TicketRepository;
import com.soporte.service.AuthService;
import com.soporte.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/soporte")
@PreAuthorize("hasAnyRole('AGENTE','SUPERVISOR','ADMINISTRADOR')")
@RequiredArgsConstructor
public class SoporteController {

    private final TicketService ticketService;
    private final AuthService authService;
    private final TicketRepository ticketRepository;

    @GetMapping("/bandeja")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> bandeja(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(ticketService.listarTodos(pageable)));
    }

    @GetMapping("/mis-tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> misTicketsAsignados(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Usuario agente = authService.getUsuarioActual();
        return ResponseEntity.ok(ApiResponse.ok(ticketService.listarTicketsAgente(agente, pageable)));
    }

    @GetMapping("/nuevos")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> nuevos() {
        List<TicketResponse> tickets = ticketRepository.findTicketsNuevos()
                .stream().map(ticketService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SUPERVISOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> stats = Map.of(
                "nuevos", ticketRepository.countByEstatusNombre("Nuevo"),
                "enAtencion", ticketRepository.countByEstatusNombre("En atención"),
                "resueltos", ticketRepository.countByEstatusNombre("Resuelto"),
                "cerrados", ticketRepository.countByEstatusNombre("Cerrado"),
                "vencidos", ticketRepository.findTicketsVencidos(java.time.LocalDateTime.now()).size()
        );
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
