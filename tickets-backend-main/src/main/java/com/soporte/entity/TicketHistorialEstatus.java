package com.soporte.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_historial_estatus")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketHistorialEstatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estatus_anterior_id")
    private EstatusTicket estatusAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estatus_nuevo_id", nullable = false)
    private EstatusTicket estatusNuevo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cambiado_por_usuario_id", nullable = false)
    private Usuario cambiadoPor;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
