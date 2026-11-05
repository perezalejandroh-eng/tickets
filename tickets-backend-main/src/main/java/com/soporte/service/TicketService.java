package com.soporte.service;

import com.soporte.dto.request.CambioEstatusRequest;
import com.soporte.dto.request.ComentarioRequest;
import com.soporte.dto.request.TicketCreateRequest;
import com.soporte.dto.response.TicketResponse;
import com.soporte.entity.*;
import com.soporte.exception.BusinessException;
import com.soporte.exception.ResourceNotFoundException;
import com.soporte.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketComentarioRepository comentarioRepository;
    private final TicketEvidenciaRepository evidenciaRepository;
    private final TicketHistorialEstatusRepository historialRepository;
    private final DependenciaRepository dependenciaRepository;
    private final EdificioRepository edificioRepository;
    private final PisoRepository pisoRepository;
    private final TipoSolicitudRepository tipoSolicitudRepository;
    private final CategoriaServicioRepository categoriaRepository;
    private final SubcategoriaServicioRepository subcategoriaRepository;
    private final ImpactoRepository impactoRepository;
    private final UrgenciaRepository urgenciaRepository;
    private final PrioridadRepository prioridadRepository;
    private final EstatusTicketRepository estatusRepository;
    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;
    private final NotificacionService notificacionService;
    private final ParametroSistemaRepository parametroRepository;

    @Transactional
    public TicketResponse crearTicket(TicketCreateRequest req, Usuario usuario, List<MultipartFile> archivos) {
        EstatusTicket estatusInicial = estatusRepository.findByNombre("Nuevo")
                .orElseThrow(() -> new BusinessException("Estatus inicial 'Nuevo' no configurado"));

        Impacto impacto = impactoRepository.findById(req.getImpactoId())
                .orElseThrow(() -> new ResourceNotFoundException("Impacto no encontrado"));
        Urgencia urgencia = urgenciaRepository.findById(req.getUrgenciaId())
                .orElseThrow(() -> new ResourceNotFoundException("Urgencia no encontrada"));
        Prioridad prioridad = calcularPrioridad(impacto.getValor(), urgencia.getValor());

        Ticket ticket = Ticket.builder()
                .folio(generarFolio())
                .usuario(usuario)
                .asunto(req.getAsunto())
                .descripcion(req.getDescripcion())
                .impacto(impacto)
                .urgencia(urgencia)
                .prioridad(prioridad)
                .estatus(estatusInicial)
                .canalOrigen(req.getCanalOrigen())
                .build();

        if (req.getDependenciaId() != null)
            ticket.setDependencia(dependenciaRepository.findById(req.getDependenciaId()).orElse(usuario.getDependencia()));
        else
            ticket.setDependencia(usuario.getDependencia());

        if (req.getEdificioId() != null)
            ticket.setEdificio(edificioRepository.findById(req.getEdificioId()).orElse(usuario.getEdificio()));
        else
            ticket.setEdificio(usuario.getEdificio());

        if (req.getPisoId() != null)
            ticket.setPiso(pisoRepository.findById(req.getPisoId()).orElse(usuario.getPiso()));
        else
            ticket.setPiso(usuario.getPiso());

        ticket.setArea(req.getArea() != null ? req.getArea() : usuario.getArea());

        if (req.getTipoSolicitudId() != null)
            ticket.setTipoSolicitud(tipoSolicitudRepository.findById(req.getTipoSolicitudId()).orElse(null));
        if (req.getCategoriaServicioId() != null)
            ticket.setCategoriaServicio(categoriaRepository.findById(req.getCategoriaServicioId()).orElse(null));
        if (req.getSubcategoriaServicioId() != null)
            ticket.setSubcategoriaServicio(subcategoriaRepository.findById(req.getSubcategoriaServicioId()).orElse(null));

        // SLA según prioridad
        int horasSlaRespuesta = obtenerParamInt("sla_respuesta_horas_" + prioridad.getNombre().toLowerCase(), 24);
        int horasSlaResolucion = obtenerParamInt("sla_resolucion_horas_" + prioridad.getNombre().toLowerCase(), 72);
        ticket.setSlaRespuesta(LocalDateTime.now().plusHours(horasSlaRespuesta));
        ticket.setSlaResolucion(LocalDateTime.now().plusHours(horasSlaResolucion));

        Ticket savedTicket = ticketRepository.save(ticket);

        // Registrar historial
        registrarHistorial(savedTicket, null, estatusInicial, usuario, "Ticket creado");

        // Adjuntar evidencias
        if (archivos != null && !archivos.isEmpty()) {
            adjuntarEvidencias(savedTicket, null, archivos, usuario);
        }

        // Notificar
        notificacionService.notificar(usuario, savedTicket, "TICKET_CREADO",
                "Ticket creado: " + savedTicket.getFolio(), "Tu ticket ha sido registrado exitosamente.");

        notificarAgentes(savedTicket, "Nuevo ticket: " + savedTicket.getFolio(),
                "Se ha registrado un nuevo ticket que requiere atención.");

        return toResponse(savedTicket);
    }

    @Transactional
    public TicketResponse cambiarEstatus(Long ticketId, CambioEstatusRequest req, Usuario usuario) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        EstatusTicket nuevoEstatus = estatusRepository.findById(req.getNuevoEstatusId())
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado"));

        EstatusTicket estatusAnterior = ticket.getEstatus();
        ticket.setEstatus(nuevoEstatus);

        if (req.getSolucion() != null && !req.getSolucion().isBlank()) {
            ticket.setSolucion(req.getSolucion());
        }

        if (nuevoEstatus.getNombre().equals("Resuelto") || nuevoEstatus.getNombre().equals("Cerrado")) {
            if (nuevoEstatus.getNombre().equals("Resuelto")) ticket.setFechaResolucion(LocalDateTime.now());
            if (nuevoEstatus.getNombre().equals("Cerrado")) ticket.setFechaCierre(LocalDateTime.now());
        }

        ticketRepository.save(ticket);
        registrarHistorial(ticket, estatusAnterior, nuevoEstatus, usuario, req.getComentario());

        // Notificar al usuario
        notificacionService.notificar(ticket.getUsuario(), ticket, "CAMBIO_ESTATUS",
                "Actualización: " + ticket.getFolio(),
                "Tu ticket cambió de estado a: " + nuevoEstatus.getNombre());

        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse asignarTicket(Long ticketId, Long agenteId, Usuario asignadoPor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        Usuario agente = usuarioRepository.findById(agenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Agente no encontrado"));

        ticket.setAgenteAsignado(agente);
        ticket.setFechaAsignacion(LocalDateTime.now());

        EstatusTicket asignado = estatusRepository.findByNombre("Asignado")
                .orElse(ticket.getEstatus());
        EstatusTicket anterior = ticket.getEstatus();
        ticket.setEstatus(asignado);

        ticketRepository.save(ticket);
        registrarHistorial(ticket, anterior, asignado, asignadoPor, "Ticket asignado a " + agente.getNombreCompleto());

        notificacionService.notificar(agente, ticket, "TICKET_ASIGNADO",
                "Ticket asignado: " + ticket.getFolio(), "Se te ha asignado un nuevo ticket.");
        notificacionService.notificar(ticket.getUsuario(), ticket, "TICKET_ASIGNADO",
                "Actualización: " + ticket.getFolio(), "Tu ticket ha sido asignado a " + agente.getNombreCompleto());

        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse.ComentarioResponse agregarComentario(Long ticketId, ComentarioRequest req,
                                                                Usuario usuario, List<MultipartFile> archivos) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        TicketComentario comentario = TicketComentario.builder()
                .ticket(ticket)
                .usuario(usuario)
                .comentario(req.getComentario())
                .esInterno(req.isEsInterno())
                .build();
        comentarioRepository.save(comentario);

        if (archivos != null && !archivos.isEmpty()) {
            adjuntarEvidencias(ticket, comentario, archivos, usuario);
        }

        if (!req.isEsInterno()) {
            Usuario destinatario = usuario.getId().equals(ticket.getUsuario().getId())
                    ? ticket.getAgenteAsignado() : ticket.getUsuario();
            if (destinatario != null) {
                notificacionService.notificar(destinatario, ticket, "COMENTARIO_NUEVO",
                        "Nuevo comentario: " + ticket.getFolio(),
                        usuario.getNombreCompleto() + " dejó un comentario.");
            }
        }

        return toComentarioResponse(comentario);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> listarTicketsUsuario(Usuario usuario, Pageable pageable) {
        return ticketRepository.findByUsuario(usuario, pageable).map(this::toResponseSimple);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> listarTicketsAgente(Usuario agente, Pageable pageable) {
        return ticketRepository.findByAgenteAsignado(agente, pageable).map(this::toResponseSimple);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> listarTodos(Pageable pageable) {
        return ticketRepository.findAll(pageable).map(this::toResponseSimple);
    }

    @Transactional(readOnly = true)
    public TicketResponse obtenerDetalle(Long id, Usuario usuario) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        String rol = usuario.getRol().getNombre();
        if (rol.equals("USUARIO") && !ticket.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("No tienes permiso para ver este ticket");
        }

        return toResponse(ticket);
    }

    private void adjuntarEvidencias(Ticket ticket, TicketComentario comentario,
                                    List<MultipartFile> archivos, Usuario usuario) {
        for (MultipartFile archivo : archivos) {
            if (!archivo.isEmpty()) {
                String ruta = fileStorageService.guardarArchivo(archivo, "tickets/" + ticket.getFolio());
                TicketEvidencia evidencia = TicketEvidencia.builder()
                        .ticket(ticket)
                        .comentario(comentario)
                        .nombreOriginal(archivo.getOriginalFilename())
                        .nombreArchivo(ruta.substring(ruta.lastIndexOf('/') + 1))
                        .rutaArchivo(ruta)
                        .tipoMime(archivo.getContentType())
                        .tamanoBytes(archivo.getSize())
                        .usuario(usuario)
                        .build();
                evidenciaRepository.save(evidencia);
            }
        }
    }

    private void registrarHistorial(Ticket ticket, EstatusTicket anterior, EstatusTicket nuevo,
                                    Usuario usuario, String comentario) {
        TicketHistorialEstatus historial = TicketHistorialEstatus.builder()
                .ticket(ticket)
                .estatusAnterior(anterior)
                .estatusNuevo(nuevo)
                .cambiadoPor(usuario)
                .comentario(comentario)
                .build();
        historialRepository.save(historial);
    }

    private Prioridad calcularPrioridad(int impactoValor, int urgenciaValor) {
        int suma = impactoValor + urgenciaValor;
        int nivel;
        if (suma <= 2) nivel = 1;       // Baja
        else if (suma <= 4) nivel = 2;  // Media
        else if (suma <= 6) nivel = 3;  // Alta
        else nivel = 4;                  // Crítica

        return prioridadRepository.findByNivel(nivel)
                .orElseGet(() -> prioridadRepository.findByNivel(2).orElseThrow());
    }

    private String generarFolio() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = ticketRepository.count() + 1;
        return "TKT-" + fecha + "-" + String.format("%04d", count);
    }

    private int obtenerParamInt(String clave, int defaultValue) {
        return parametroRepository.findByClave(clave)
                .map(p -> {
                    try { return Integer.parseInt(p.getValor()); }
                    catch (NumberFormatException e) { return defaultValue; }
                }).orElse(defaultValue);
    }

    private void notificarAgentes(Ticket ticket, String titulo, String mensaje) {
        usuarioRepository.findSoloAgentes().forEach(agente ->
                notificacionService.notificar(agente, ticket, "TICKET_NUEVO", titulo, mensaje));
    }

    @Transactional(readOnly = true)
    public TicketResponse toResponse(Ticket ticket) {
        List<TicketResponse.ComentarioResponse> comentarios = comentarioRepository
                .findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream().map(this::toComentarioResponse).collect(Collectors.toList());

        List<TicketResponse.EvidenciaResponse> evidencias = evidenciaRepository
                .findByTicketIdAndComentarioIsNull(ticket.getId())
                .stream().map(this::toEvidenciaResponse).collect(Collectors.toList());

        List<TicketResponse.HistorialEstatusResponse> historial = historialRepository
                .findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream().map(this::toHistorialResponse).collect(Collectors.toList());

        return buildTicketResponse(ticket, comentarios, evidencias, historial);
    }

    private TicketResponse toResponseSimple(Ticket ticket) {
        return buildTicketResponse(ticket, null, null, null);
    }

    private TicketResponse buildTicketResponse(Ticket ticket,
                                               List<TicketResponse.ComentarioResponse> comentarios,
                                               List<TicketResponse.EvidenciaResponse> evidencias,
                                               List<TicketResponse.HistorialEstatusResponse> historial) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .folio(ticket.getFolio())
                .asunto(ticket.getAsunto())
                .descripcion(ticket.getDescripcion())
                .solucion(ticket.getSolucion())
                .usuarioId(ticket.getUsuario().getId())
                .usuarioNombre(ticket.getUsuario().getNombreCompleto())
                .dependenciaNombre(ticket.getDependencia() != null ? ticket.getDependencia().getNombre() : null)
                .edificioNombre(ticket.getEdificio() != null ? ticket.getEdificio().getNombre() : null)
                .pisoNombre(ticket.getPiso() != null ? ticket.getPiso().getNombre() : null)
                .area(ticket.getArea())
                .tipoSolicitud(ticket.getTipoSolicitud() != null ? ticket.getTipoSolicitud().getNombre() : null)
                .categoriaServicio(ticket.getCategoriaServicio() != null ? ticket.getCategoriaServicio().getNombre() : null)
                .subcategoriaServicio(ticket.getSubcategoriaServicio() != null ? ticket.getSubcategoriaServicio().getNombre() : null)
                .impacto(ticket.getImpacto() != null ? ticket.getImpacto().getNombre() : null)
                .urgencia(ticket.getUrgencia() != null ? ticket.getUrgencia().getNombre() : null)
                .prioridad(ticket.getPrioridad() != null ? ticket.getPrioridad().getNombre() : null)
                .prioridadColor(ticket.getPrioridad() != null ? ticket.getPrioridad().getColor() : null)
                .estatus(ticket.getEstatus() != null ? ticket.getEstatus().getNombre() : null)
                .estatusColor(ticket.getEstatus() != null ? ticket.getEstatus().getColor() : null)
                .agenteId(ticket.getAgenteAsignado() != null ? ticket.getAgenteAsignado().getId() : null)
                .agenteNombre(ticket.getAgenteAsignado() != null ? ticket.getAgenteAsignado().getNombreCompleto() : null)
                .canalOrigen(ticket.getCanalOrigen())
                .fechaAsignacion(ticket.getFechaAsignacion())
                .fechaResolucion(ticket.getFechaResolucion())
                .fechaCierre(ticket.getFechaCierre())
                .slaRespuesta(ticket.getSlaRespuesta())
                .slaResolucion(ticket.getSlaResolucion())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comentarios(comentarios)
                .evidencias(evidencias)
                .historial(historial)
                .build();
    }

    private TicketResponse.ComentarioResponse toComentarioResponse(TicketComentario c) {
        List<TicketResponse.EvidenciaResponse> evidencias = evidenciaRepository
                .findByComentarioId(c.getId())
                .stream().map(this::toEvidenciaResponse).collect(Collectors.toList());
        return TicketResponse.ComentarioResponse.builder()
                .id(c.getId())
                .comentario(c.getComentario())
                .autorId(c.getUsuario().getId())
                .autorNombre(c.getUsuario().getNombreCompleto())
                .esInterno(c.getEsInterno())
                .createdAt(c.getCreatedAt())
                .evidencias(evidencias)
                .build();
    }

    private TicketResponse.EvidenciaResponse toEvidenciaResponse(TicketEvidencia e) {
        return TicketResponse.EvidenciaResponse.builder()
                .id(e.getId())
                .nombreOriginal(e.getNombreOriginal())
                .nombreArchivo(e.getNombreArchivo())
                .url(e.getRutaArchivo())
                .tipoMime(e.getTipoMime())
                .tamanoBytes(e.getTamanoBytes())
                .subioPor(e.getUsuario().getNombreCompleto())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private TicketResponse.HistorialEstatusResponse toHistorialResponse(TicketHistorialEstatus h) {
        return TicketResponse.HistorialEstatusResponse.builder()
                .estatusAnterior(h.getEstatusAnterior() != null ? h.getEstatusAnterior().getNombre() : null)
                .estatusNuevo(h.getEstatusNuevo().getNombre())
                .cambiadoPor(h.getCambiadoPor().getNombreCompleto())
                .comentario(h.getComentario())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
