package com.soporte.service;

import com.soporte.entity.Notificacion;
import com.soporte.entity.Ticket;
import com.soporte.entity.Usuario;
import com.soporte.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final EmailService emailService;

    @Transactional
    public void notificar(Usuario usuario, Ticket ticket, String tipo, String titulo, String mensaje) {
        Notificacion notificacion = Notificacion.builder()
                .usuario(usuario)
                .ticket(ticket)
                .tipo(tipo)
                .titulo(titulo)
                .mensaje(mensaje)
                .leida(false)
                .enviadaCorreo(false)
                .build();
        notificacionRepository.save(notificacion);

        try {
            emailService.enviarNotificacionTicket(usuario, ticket, titulo, mensaje);
            notificacion.setEnviadaCorreo(true);
            notificacionRepository.save(notificacion);
        } catch (Exception e) {
            log.error("Error enviando correo de notificación: {}", e.getMessage());
        }
    }

    public Page<Notificacion> obtenerNotificaciones(Usuario usuario, Pageable pageable) {
        return notificacionRepository.findByUsuarioOrderByCreatedAtDesc(usuario, pageable);
    }

    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalseOrderByCreatedAtDesc(usuario);
    }

    public Long contarNoLeidas(Usuario usuario) {
        return notificacionRepository.countByUsuarioAndLeidaFalse(usuario);
    }

    @Transactional
    public void marcarLeida(Long notificacionId, Usuario usuario) {
        notificacionRepository.findById(notificacionId).ifPresent(n -> {
            if (n.getUsuario().getId().equals(usuario.getId())) {
                n.setLeida(true);
                n.setFechaLectura(LocalDateTime.now());
                notificacionRepository.save(n);
            }
        });
    }

    @Transactional
    public void marcarTodasLeidas(Usuario usuario) {
        notificacionRepository.marcarTodasLeidas(usuario);
    }
}
